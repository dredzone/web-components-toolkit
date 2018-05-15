import { dget } from './object.js';
import { dset } from './object.js';
import clone from './clone.js';
import is from './type.js';
import createStorage from './create-storage.js';
import uniqueId from './unique-id.js';

const model = (baseClass = class {}) => {
  const privates = createStorage();
  let subscriberCount = 0;

  return class Model extends baseClass {
    constructor(...args) {
      super(...args);
      this._stateKey = uniqueId('_state');
      this._subscribers = new Map();
      this._setState(this.defaultState);
    }

    get defaultState() {
      return {};
    }

    get(accessor) {
      return this._getState(accessor);
    }

    set(arg1, arg2) {
      //supports (accessor, state) OR (state) arguments for setting the whole thing
      let accessor, value;
      if (!is.string(arg1) && is.undefined(arg2)) {
        value = arg1;
      } else {
        value = arg2;
        accessor = arg1;
      }
      let oldState = this._getState();
      let newState = clone.json(oldState);

      if (accessor) {
        dset(newState, accessor, value);
      } else {
        newState = value;
      }
      this._setState(newState);
      this._notifySubscribers(accessor, newState, oldState);
      return this;
    }

    createSubscriber() {
      const context = subscriberCount++;
      const self = this;
      return {
        on: function(...args) {
          self._subscribe(context, ...args);
          return this;
        },
        //TODO: is off() needed for individual subscription?
        destroy: this._destroySubscriber.bind(this, context)
      };
    }

    createPropertyBinder(context) {
      if (!context) {
        throw new Error('createPropertyBinder(context) - context must be object');
      }
      const self = this;
      return {
        addBindings: function(bindRules) {
          if (!Array.isArray(bindRules[0])) {
            bindRules = [bindRules];
          }
          bindRules.forEach(bindRule => {
            self._subscribe(context, bindRule[0], value => {
              dset(context, bindRule[1], value);
            });
          });
          return this;
        },
        destroy: this._destroySubscriber.bind(this, context)
      };
    }

    _getState(accessor) {
      return clone.json(accessor ? dget(privates[this._stateKey], accessor) : privates[this._stateKey]);
    }

    _setState(newState) {
      privates[this._stateKey] = newState;
    }

    _subscribe(context, accessor, cb) {
      const subscriptions = this._subscribers.get(context) || [];
      subscriptions.push({ accessor, cb });
      this._subscribers.set(context, subscriptions);
    }

    _destroySubscriber(context) {
      this._subscribers.delete(context);
    }

    _notifySubscribers(setAccessor, newState, oldState) {
      this._subscribers.forEach(function(subscribers) {
        subscribers.forEach(function({ accessor, cb }) {
          //e.g.  sa='foo.bar.baz', a='foo.bar.baz'
          //e.g.  sa='foo.bar.baz', a='foo.bar.baz.blaz'
          if (accessor.indexOf(setAccessor) === 0) {
            cb(dget(newState, accessor), dget(oldState, accessor));
            return;
          }
          //e.g. sa='foo.bar.baz', a='foo.*'
          if (accessor.indexOf('*') > -1) {
            const deepAccessor = accessor.replace('.*', '').replace('*', '');
            if (setAccessor.indexOf(deepAccessor) === 0) {
              cb(dget(newState, deepAccessor), dget(oldState, deepAccessor));
              return;
            }
          }
        });
      });
    }
  };
};
export default model;
