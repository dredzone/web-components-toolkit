/* @flow */
import before from '../advice/before';
import createStorage from '../create-storage';
import microTask from '../dom/microtask';
import type {ICustomElement} from './custom-element-mixin';

export type PropertyConfig = {
	type: Function;
	value?: any;
	reflectToAttribute: boolean;
	readOnly: boolean;
	observer?: string | Function;
	notify: boolean;
	hasObserver: boolean;
	isObserver: boolean;
	isObserverString: boolean;
	isString: boolean;
	isNumber: boolean;
	isBoolean: boolean;
	isObject: boolean;
	isArray: boolean;
	isDate: boolean;
}

export type PropertiesConfig = {
	[string]: PropertyConfig
}

export interface IProperties {
	static +classProperties: PropertiesConfig;

	static createProperties(): void;

	static attributeToPropertyName(attribute: string): string;

	static propertyNameToAttribute(property: string): string;

	propertiesChanged(currentProps: Object, changedProps: Object, oldProps: Object): void;

	_createPropertyAccessor(property: string, readOnly: boolean): void;

	_getProperty(property: string): any;

	_setProperty(property: string, newValue: any): void;

	_initializeProtoProperties(): void;

	_initializeProperties(): void;

	_attributeToProperty(attribute: string, value: string): void;

	_isValidPropertyValue(property: string, value: any): boolean;

	_propertyToAttribute(property: string, value: any): void;

	_deserializeValue(property: string, value: any): any;

	_serializeValue(property: string, value: any): any;

	_setPendingProperty(property: string, value: any): boolean;

	_invalidateProperties(): void;

	_flushProperties(): void;

	_shouldPropertiesChange(currentProps: Object, changedProps: Object, oldProps: Object): boolean;

	_shouldPropertyChange(property: string, value: any, old: any): boolean;
}

type InType = HTMLElement & ICustomElement;
type OutType = InType & IProperties;

export default (baseClass: Class<InType>): Class<OutType> => {
	const {defineProperty, keys, assign} = Object;
	const attributeToPropertyNames: {[key: string]: string} = {};
	const propertyNamesToAttributes: {[key: string]: string} = {};
	const storage: Function = createStorage();

	let propertiesConfig: PropertiesConfig;
	let dataHasAccessor: {[key: string]: boolean} = {};
	let dataProtoValues: {[key: string]: boolean} = {};

	function enhancePropertyConfig(config: Object): void {
		config.hasObserver = 'observer' in config;
		config.isObserverString = config.hasObserver && typeof config.observer === 'string';
		config.isString = config.type === String;
		config.isNumber = config.type === Number;
		config.isBoolean = config.type === Boolean;
		config.isObject = config.type === Object;
		config.isArray = config.type === Array;
		config.isDate = config.type === Date;
		config.notify = 'notify' in config;
		config.readOnly = ('readOnly' in config) ? config.readOnly : false;
		config.reflectToAttribute = 'reflectToAttribute' in config ?
			config.reflectToAttribute : config.isString || config.isNumber || config.isBoolean;
	}

	function normalizeProperties(properties: Object): PropertyConfig {
		const output: Object = {};
		for (let name in properties) {
			if (!Object.hasOwnProperty.call(properties, name)) {
				continue;
			}
			const property: Object = properties[name];
			output[name] = (typeof property === 'function') ? {type: property} : property;
			enhancePropertyConfig(output[name]);
		}
		return output;
	}

	function createConnectedAdvice(): Function {
		return function (): void {
			const context: IProperties = this;
			if (Object.keys(storage(context).initializeProperties).length > 0) {
				assign(context, storage(context).initializeProperties);
				storage(context).initializeProperties = {};
			}
			context._flushProperties();
		};
	}

	function createAttributeChangeAdvice(): Function {
		return function (attribute: string, oldValue: any, newValue: any): void {
			const context: IProperties = this;
			if (oldValue !== newValue) {
				context._attributeToProperty(attribute, newValue);
			}
		};
	}

	function createPropertiesChangedAdvice(): Function {
		return function (currentProps: Object, changedProps: Object, oldProps: Object): void {
			let context: IProperties & HTMLElement = this;
			Object.keys(changedProps).forEach((property: string) => {
				const {notify, hasObserver, reflectToAttribute, isObserverString, observer} = context.constructor.classProperties[property];
				if (reflectToAttribute) {
					context._propertyToAttribute(property, changedProps[property]);
				}
				if (hasObserver && isObserverString) {
					this[observer](changedProps[property], oldProps[property]);
				} else if (hasObserver && typeof observer === 'function') {
					observer.apply(context, [changedProps[property], oldProps[property]]);
				}
				if (notify) {
					context.dispatchEvent(new CustomEvent(`${property}-changed`, {
						detail: {
							newValue: changedProps[property],
							oldValue: oldProps[property]
						}
					}));
				}
			});
		};
	}

	return class Properties extends baseClass implements IProperties {
		$key: any;
		$value: any;

		static get observedAttributes(): Array<string> {
			return Object.keys(this.classProperties)
				.map((property: string) => this.propertyNameToAttribute(property)) || [];
		}

		static finalizeClass(): void {
			super.finalizeClass();
			before(createConnectedAdvice(), 'connected')(this);
			before(createAttributeChangeAdvice(), 'attributeChanged')(this);
			before(createPropertiesChangedAdvice(), 'propertiesChanged')(this);
			this.createProperties();
		}

		static attributeToPropertyName(attribute: string): string {
			let property: ?string = attributeToPropertyNames[attribute];
			if (!property) {
				// Convert and memoize.
				const hypenRegEx: RegExp = /-([a-z])/g;
				property = attribute.replace(hypenRegEx, match => match[1].toUpperCase());
				attributeToPropertyNames[attribute] = property;
			}
			return property;
		}

		static propertyNameToAttribute(property: string): string {
			let attribute: ?string = propertyNamesToAttributes[property];
			if (!attribute) {
				// Convert and memoize.
				const uppercaseRegEx: RegExp = /([A-Z])/g;
				attribute = property.replace(uppercaseRegEx, '-$1').toLowerCase();
				propertyNamesToAttributes[property] = attribute;
			}
			return attribute;
		}

		static get classProperties(): PropertiesConfig {
			if (!propertiesConfig) {
				const getPropertiesConfig = () => propertiesConfig || {};
				let checkObj: any = null;
				let loop: boolean = true;

				while (loop) {
					checkObj = Object.getPrototypeOf(checkObj === null ? this : checkObj);
					if (!checkObj || !checkObj.constructor ||
						checkObj.constructor === HTMLElement ||
						checkObj.constructor === Function ||
						checkObj.constructor === Object ||
						checkObj.constructor === checkObj.constructor.constructor) {
						loop = false;
					}
					if (Object.hasOwnProperty.call(checkObj, 'properties')) {
						// $FlowFixMe
						propertiesConfig = assign(getPropertiesConfig(), normalizeProperties(checkObj.properties));
					}
				}
				if (this.properties) {
					// $FlowFixMe
					propertiesConfig = assign(getPropertiesConfig(), normalizeProperties(this.properties));
				}
			}
			return propertiesConfig;
		}

		static createProperties(): void {
			const proto = this.prototype;
			const properties: PropertiesConfig = this.classProperties;
			keys(properties).forEach((property: string) => {
				if (Object.hasOwnProperty.call(proto, property)) {
					throw new Error(`Unable to setup property '${property}', property already exists`);
				}
				const propertyValue: any = properties[property].value;
				if (propertyValue !== undefined) {
					dataProtoValues[property] = propertyValue;
				}
				proto._createPropertyAccessor(property, properties[property].readOnly);
			});
		}

		construct() {
			super.construct();
			storage(this).data = {};
			storage(this).serializing = false;
			storage(this).initializeProperties = {};
			storage(this).dataPending = null;
			storage(this).dataOld = null;
			storage(this).dataInvalid = false;
			this._initializeProtoProperties();
			this._initializeProperties();
		}

		propertiesChanged(currentProps: Object, changedProps: Object, oldProps: Object): void { // eslint-disable-line no-unused-vars

		}

		_createPropertyAccessor(property: string, readOnly: boolean): void {
			if (!dataHasAccessor[property]) {
				dataHasAccessor[property] = true;
				defineProperty(this, property, {
					enumerable: true,
					configurable: true,
					get() {
						return this._getProperty(property);
					},
					set: readOnly ? () => {} : function (newValue: any) {
						this._setProperty(property, newValue);
					}
				});
			}
		}

		_getProperty(property: string): any {
			return storage(this).data[property];
		}

		_setProperty(property: string, newValue: any): void {
			if (this._isValidPropertyValue(property, newValue)) {
				if (this._setPendingProperty(property, newValue)) {
					this._invalidateProperties();
				}
			} else {
				console.log(`invalid value ${newValue} for property ${property} of 
					type ${this.constructor.classProperties[property].type.name}`);
			}
		}

		_initializeProtoProperties(): void {
			Object.keys(dataProtoValues).forEach((property: string) => {
				const value = typeof dataProtoValues[property] === 'function' ?
					dataProtoValues[property].call(this) : dataProtoValues[property];
				this._setProperty(property, value);
			});
		}

		_initializeProperties(): void {
			Object.keys(dataHasAccessor).forEach((property: string) => {
				if (Object.hasOwnProperty.call(this, property)) {
					storage(this).initializeProperties[property] = this[property];
					delete this[property];
				}
			});
		}

		_attributeToProperty(attribute: string, value: string): void {
			if (!storage(this).serializing) {
				const property: string = this.constructor.attributeToPropertyName(attribute);
				this[property] = this._deserializeValue(property, value);
			}
		}

		_isValidPropertyValue(property: string, value: any): boolean {
			const propertyType: Function = this.constructor.classProperties[property].type;
			let isValid: boolean = false;
			if (typeof value === 'object') {
				isValid = value instanceof propertyType;
			} else {
				isValid = `${typeof value}` === propertyType.name.toLowerCase();
			}
			return isValid;
		}

		_propertyToAttribute(property: string, value: any): void {
			storage(this).serializing = true;
			const attribute = this.constructor.propertyNameToAttribute(property);
			value = this._serializeValue(property, value);
			if (value === undefined) {
				this.removeAttribute(attribute);
			} else if (this.getAttribute(attribute) !== value) {
				this.setAttribute(attribute, value);
			}
			storage(this).serializing = false;
		}

		_deserializeValue(property: string, value: any): any {
			const {isNumber, isArray, isBoolean, isDate, isString, isObject} = this.constructor.classProperties[property];
			if (isBoolean) {
				value = (value !== null && value !== undefined);
			} else if (isNumber) {
				value = value === null || value === undefined ? 0 : Number(value);
			} else if (isString) {
				value = value === null || value === undefined ? '' : String(value);
			} else if (isObject || isArray) {
				value = value === null || value === undefined ? isArray ? null : {} : JSON.parse(value);
			} else if (isDate) {
				value = value === null || value === undefined ? '' : new Date(value);
			}
			return value;
		}

		_serializeValue(property: string, value: any): any {
			const propertyConfig: PropertyConfig = this.constructor.classProperties[property];
			const {isBoolean, isObject, isArray} = propertyConfig;

			if (isBoolean) {
				return value ? '' : undefined;
			}
			if (isObject || isArray) {
				return JSON.stringify(value);
			}

			value = value ? value.toString() : undefined;
			return value;
		}

		_setPendingProperty(property: string, value: any): boolean {
			let old = storage(this).data[property];
			let changed = this._shouldPropertyChange(property, value, old);
			if (changed) {
				if (!storage(this).dataPending) {
					storage(this).dataPending = {};
					storage(this).dataOld = {};
				}
				// Ensure old is captured from the last turn
				if (storage(this).dataOld && !(property in storage(this).dataOld)) {
					storage(this).dataOld[property] = old;
				}
				storage(this).data[property] = value;
				storage(this).dataPending[property] = value;
			}
			return changed;
		}

		_invalidateProperties(): void {
			if (!storage(this).dataInvalid) {
				storage(this).dataInvalid = true;
				microTask.run(() => {
					if (storage(this).dataInvalid) {
						storage(this).dataInvalid = false;
						this._flushProperties();
					}
				});
			}
		}

		_flushProperties(): void {
			const props: Object = storage(this).data;
			const changedProps: Object = storage(this).dataPending;
			const old: Object = storage(this).dataOld;

			if (this._shouldPropertiesChange(props, changedProps, old)) {
				storage(this).dataPending = null;
				storage(this).dataOld = null;
				this.propertiesChanged(props, changedProps, old);
			}
		}

		_shouldPropertiesChange(currentProps: Object, changedProps: Object, oldProps: Object): boolean { // eslint-disable-line no-unused-vars
			return Boolean(changedProps);
		}

		_shouldPropertyChange(property: string, value: any, old: any): boolean {
			return (
				// Strict equality check
				(old !== value &&
					// This ensures (old==NaN, value==NaN) always returns false
					(old === old || value === value)) // eslint-disable-line no-self-compare
			);
		}
	};
};
