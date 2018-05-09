/*  */
import before from '../advice/before.js';
import createStorage from '../create-storage.js';
import microTask from '../dom/microtask.js';





export default (baseClass) => {
  const { defineProperty, keys, assign } = Object;
  const attributeToPropertyNames = {};
  const propertyNamesToAttributes = {};
  const privates = createStorage();

  let propertiesConfig;
  let dataHasAccessor = {};
  let dataProtoValues = {};

  function enhancePropertyConfig(config) {
    config.hasObserver = 'observer' in config;
    config.isObserverString =
      config.hasObserver && typeof config.observer === 'string';
    config.isString = config.type === String;
    config.isNumber = config.type === Number;
    config.isBoolean = config.type === Boolean;
    config.isObject = config.type === Object;
    config.isArray = config.type === Array;
    config.isDate = config.type === Date;
    config.notify = 'notify' in config;
    config.readOnly = 'readOnly' in config ? config.readOnly : false;
    config.reflectToAttribute =
      'reflectToAttribute' in config
        ? config.reflectToAttribute
        : config.isString || config.isNumber || config.isBoolean;
  }

  function normalizeProperties(properties) {
    const output = {};
    for (let name in properties) {
      if (!Object.hasOwnProperty.call(properties, name)) {
        continue;
      }
      const property = properties[name];
      output[name] =
        typeof property === 'function' ? { type: property } : property;
      enhancePropertyConfig(output[name]);
    }
    return output;
  }

  function createConnectedAdvice() {
    return function() {
      const context = this;
      if (Object.keys(privates(context).initializeProperties).length > 0) {
        assign(context, privates(context).initializeProperties);
        privates(context).initializeProperties = {};
      }
      context._flushProperties();
    };
  }

  function createAttributeChangeAdvice() {
    return function(attribute, oldValue, newValue) {
      const context = this;
      if (oldValue !== newValue) {
        context._attributeToProperty(attribute, newValue);
      }
    };
  }

  function createPropertiesChangedAdvice() {
    return function(
      currentProps,
      changedProps,
      oldProps
    ) {
      let context = this;
      Object.keys(changedProps).forEach((property) => {
        const {
          notify,
          hasObserver,
          reflectToAttribute,
          isObserverString,
          observer
        } = context.constructor.classProperties[property];
        if (reflectToAttribute) {
          context._propertyToAttribute(property, changedProps[property]);
        }
        if (hasObserver && isObserverString) {
          this[observer](changedProps[property], oldProps[property]);
        } else if (hasObserver && typeof observer === 'function') {
          observer.apply(context, [changedProps[property], oldProps[property]]);
        }
        if (notify) {
          context.dispatchEvent(
            new CustomEvent(`${property}-changed`, {
              detail: {
                newValue: changedProps[property],
                oldValue: oldProps[property]
              }
            })
          );
        }
      });
    };
  }

  return class Properties extends baseClass {

    static get observedAttributes() {
      return (
        Object.keys(this.classProperties).map((property) =>
          this.propertyNameToAttribute(property)
        ) || []
      );
    }

    static finalizeClass() {
      super.finalizeClass();
      before(createConnectedAdvice(), 'connected')(this);
      before(createAttributeChangeAdvice(), 'attributeChanged')(this);
      before(createPropertiesChangedAdvice(), 'propertiesChanged')(this);
      this.createProperties();
    }

    static attributeToPropertyName(attribute) {
      let property = attributeToPropertyNames[attribute];
      if (!property) {
        // Convert and memoize.
        const hypenRegEx = /-([a-z])/g;
        property = attribute.replace(hypenRegEx, match =>
          match[1].toUpperCase()
        );
        attributeToPropertyNames[attribute] = property;
      }
      return property;
    }

    static propertyNameToAttribute(property) {
      let attribute = propertyNamesToAttributes[property];
      if (!attribute) {
        // Convert and memoize.
        const uppercaseRegEx = /([A-Z])/g;
        attribute = property.replace(uppercaseRegEx, '-$1').toLowerCase();
        propertyNamesToAttributes[property] = attribute;
      }
      return attribute;
    }

    static get classProperties() {
      if (!propertiesConfig) {
        const getPropertiesConfig = () => propertiesConfig || {};
        let checkObj = null;
        let loop = true;

        while (loop) {
          checkObj = Object.getPrototypeOf(checkObj === null ? this : checkObj);
          if (
            !checkObj ||
            !checkObj.constructor ||
            checkObj.constructor === HTMLElement ||
            checkObj.constructor === Function ||
            checkObj.constructor === Object ||
            checkObj.constructor === checkObj.constructor.constructor
          ) {
            loop = false;
          }
          if (Object.hasOwnProperty.call(checkObj, 'properties')) {
            // $FlowFixMe
            propertiesConfig = assign(
              getPropertiesConfig(), // $FlowFixMe
              normalizeProperties(checkObj.properties)
            );
          }
        }
        if (this.properties) {
          // $FlowFixMe
          propertiesConfig = assign(
            getPropertiesConfig(), // $FlowFixMe
            normalizeProperties(this.properties)
          );
        }
      }
      return propertiesConfig;
    }

    static createProperties() {
      const proto = this.prototype;
      const properties = this.classProperties;
      keys(properties).forEach((property) => {
        if (Object.hasOwnProperty.call(proto, property)) {
          throw new Error(
            `Unable to setup property '${property}', property already exists`
          );
        }
        const propertyValue = properties[property].value;
        if (propertyValue !== undefined) {
          dataProtoValues[property] = propertyValue;
        }
        proto._createPropertyAccessor(property, properties[property].readOnly);
      });
    }

    construct() {
      super.construct();
      privates(this).data = {};
      privates(this).serializing = false;
      privates(this).initializeProperties = {};
      privates(this).dataPending = null;
      privates(this).dataOld = null;
      privates(this).dataInvalid = false;
      this._initializeProtoProperties();
      this._initializeProperties();
    }

    propertiesChanged(
      currentProps,
      changedProps,
      oldProps // eslint-disable-line no-unused-vars
    ) {}

    _createPropertyAccessor(property, readOnly) {
      if (!dataHasAccessor[property]) {
        dataHasAccessor[property] = true;
        defineProperty(this, property, {
          enumerable: true,
          configurable: true,
          get() {
            return this._getProperty(property);
          },
          set: readOnly
            ? () => {}
            : function(newValue) {
                this._setProperty(property, newValue);
              }
        });
      }
    }

    _getProperty(property) {
      return privates(this).data[property];
    }

    _setProperty(property, newValue) {
      if (this._isValidPropertyValue(property, newValue)) {
        if (this._setPendingProperty(property, newValue)) {
          this._invalidateProperties();
        }
      } else {
        // eslint-disable-next-line no-console
        console.log(`invalid value ${newValue} for property ${property} of
					type ${this.constructor.classProperties[property].type.name}`);
      }
    }

    _initializeProtoProperties() {
      Object.keys(dataProtoValues).forEach((property) => {
        const value =
          typeof dataProtoValues[property] === 'function'
            ? dataProtoValues[property].call(this)
            : dataProtoValues[property];
        this._setProperty(property, value);
      });
    }

    _initializeProperties() {
      Object.keys(dataHasAccessor).forEach((property) => {
        if (Object.hasOwnProperty.call(this, property)) {
          privates(this).initializeProperties[property] = this[property];
          delete this[property];
        }
      });
    }

    _attributeToProperty(attribute, value) {
      if (!privates(this).serializing) {
        const property = this.constructor.attributeToPropertyName(
          attribute
        );
        this[property] = this._deserializeValue(property, value);
      }
    }

    _isValidPropertyValue(property, value) {
      const propertyType = this.constructor.classProperties[property]
        .type;
      let isValid = false;
      if (typeof value === 'object') {
        isValid = value instanceof propertyType;
      } else {
        isValid = `${typeof value}` === propertyType.name.toLowerCase();
      }
      return isValid;
    }

    _propertyToAttribute(property, value) {
      privates(this).serializing = true;
      const attribute = this.constructor.propertyNameToAttribute(property);
      value = this._serializeValue(property, value);
      if (value === undefined) {
        this.removeAttribute(attribute);
      } else if (this.getAttribute(attribute) !== value) {
        this.setAttribute(attribute, value);
      }
      privates(this).serializing = false;
    }

    _deserializeValue(property, value) {
      const {
        isNumber,
        isArray,
        isBoolean,
        isDate,
        isString,
        isObject
      } = this.constructor.classProperties[property];
      if (isBoolean) {
        value = value !== null && value !== undefined;
      } else if (isNumber) {
        value = value === null || value === undefined ? 0 : Number(value);
      } else if (isString) {
        value = value === null || value === undefined ? '' : String(value);
      } else if (isObject || isArray) {
        value =
          value === null || value === undefined
            ? isArray
              ? null
              : {}
            : JSON.parse(value);
      } else if (isDate) {
        value = value === null || value === undefined ? '' : new Date(value);
      }
      return value;
    }

    _serializeValue(property, value) {
      const propertyConfig = this.constructor.classProperties[
        property
      ];
      const { isBoolean, isObject, isArray } = propertyConfig;

      if (isBoolean) {
        return value ? '' : undefined;
      }
      if (isObject || isArray) {
        return JSON.stringify(value);
      }

      value = value ? value.toString() : undefined;
      return value;
    }

    _setPendingProperty(property, value) {
      let old = privates(this).data[property];
      let changed = this._shouldPropertyChange(property, value, old);
      if (changed) {
        if (!privates(this).dataPending) {
          privates(this).dataPending = {};
          privates(this).dataOld = {};
        }
        // Ensure old is captured from the last turn
        if (privates(this).dataOld && !(property in privates(this).dataOld)) {
          privates(this).dataOld[property] = old;
        }
        privates(this).data[property] = value;
        privates(this).dataPending[property] = value;
      }
      return changed;
    }

    _invalidateProperties() {
      if (!privates(this).dataInvalid) {
        privates(this).dataInvalid = true;
        microTask.run(() => {
          if (privates(this).dataInvalid) {
            privates(this).dataInvalid = false;
            this._flushProperties();
          }
        });
      }
    }

    _flushProperties() {
      const props = privates(this).data;
      const changedProps = privates(this).dataPending;
      const old = privates(this).dataOld;

      if (this._shouldPropertiesChange(props, changedProps, old)) {
        privates(this).dataPending = null;
        privates(this).dataOld = null;
        this.propertiesChanged(props, changedProps, old);
      }
    }

    _shouldPropertiesChange(
      currentProps,
      changedProps,
      oldProps // eslint-disable-line no-unused-vars
    ) {
      return Boolean(changedProps);
    }

    _shouldPropertyChange(property, value, old) {
      return (
        // Strict equality check
        old !== value &&
        // This ensures (old==NaN, value==NaN) always returns false
        (old === old || value === value) // eslint-disable-line no-self-compare
      );
    }
  };
};
