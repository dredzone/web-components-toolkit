/* @flow */
import createStorage from '../create-storage.js';
import after from '../advice/after.js';
import type { ICustomElement } from './custom-element.js';

export interface IState {
  +state: Object;

  setState(changes: Object, render: boolean): void;

  shouldComponentUpdate(nextState: Object): boolean;

  componentWillRender(newState: Object): void;

  componentWillUpdate(newState: Object, previousState: Object): void;

  componentDidRender(previousState: Object): void;

  componentDidUpdate(previousState: Object): void;
}

type InType = HTMLElement & ICustomElement;
type OutType = InType & IState;

export default (baseClass: Class<InType>): Class<OutType> => {
  const { assign } = Object;
  const privates: Function = createStorage();

  return class State extends baseClass implements IState {
    static finalizeClass(): void {
      super.finalizeClass();
      after(createBeforeRenderAdvice(), '_onRender')(this);
      after(createAfterRenderAdvice(), '_postRender')(this);
    }

    construct() {
      super.construct();
      this.setState(this.defaultState);
    }

    get defaultState(): Object {
      return {};
    }

    get state(): Object {
      return assign({}, privates(this).state);
    }

    shouldComponentUpdate(nextState: Object): boolean {
      for (let key in nextState) {
        if (nextState[key] !== privates(this).state[key]) {
          return true;
        }
      }
      return false;
    }

    setState(changes: Object): void {
      const nextState: Object = assign({}, privates(this).state, changes);
      const previousState: Object = privates(this).state;
      const changed = previousState === undefined || this.shouldComponentUpdate(nextState);

      if (changed) {
        privates(this).state = nextState;
        if (this.initialized) {
          this.render();
        }
      }
    }

    // eslint-disable-next-line no-unused-vars
    componentWillRender(newState: Object): void {}

    // eslint-disable-next-line no-unused-vars
    componentDidRender(previousState: Object): void {}

    // eslint-disable-next-line no-unused-vars
    componentWillUpdate(newState: Object, previousState: Object): void {}

    // eslint-disable-next-line no-unused-vars
    componentDidUpdate(previousState: Object): void {}
  };

  function createBeforeRenderAdvice(): Function {
    return function(firstRender: boolean): void {
      const context: IState = this;
      if (firstRender) {
        context.componentWillRender(this.state);
      } else {
        context.componentWillUpdate(this.state, assign({}, privates(context).renderedState));
      }
    };
  }

  function createAfterRenderAdvice(): Function {
    return function(firstRender: boolean): void {
      const context: IState = this;
      const previousState: Object = privates(context).renderedState;
      privates(context).renderedState = privates(context).state;
      if (firstRender) {
        context.componentDidRender(previousState);
      } else {
        context.componentDidUpdate(previousState);
      }
    };
  }
};
