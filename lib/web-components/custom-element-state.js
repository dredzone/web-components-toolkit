/*  */
import createStorage from '../create-storage.js';
import after from '../advice/after.js';
import merger from '../object/merge';
import clone from '../object/clone';



export default (baseClass) => {
  const privates = createStorage();
	const merge = merger();

  return class State extends baseClass {
    static finalizeClass() {
      super.finalizeClass();
      after(createBeforeRenderAdvice(), '_onRender')(this);
      after(createAfterRenderAdvice(), '_postRender')(this);
    }

    construct() {
      super.construct();
      this.setState(this.defaultState);
    }

    get defaultState() {
      return {};
    }

    get state() {
      return clone(privates(this).state);
    }

    shouldComponentUpdate(nextState) {
      for (let key in nextState) {
        if (nextState[key] !== privates(this).state[key]) {
          return true;
        }
      }
      return false;
    }

    setState(changes) {
      const nextState = merge(privates(this).state, changes);
      const previousState = privates(this).state;
      const changed = previousState === undefined || this.shouldComponentUpdate(nextState);

      if (changed) {
        privates(this).state = nextState;
        if (this.initialized) {
          this.render();
        }
      }
    }

    // eslint-disable-next-line no-unused-vars
    componentWillRender(newState) {}

    // eslint-disable-next-line no-unused-vars
    componentDidRender(previousState) {}

    // eslint-disable-next-line no-unused-vars
    componentWillUpdate(newState, previousState) {}

    // eslint-disable-next-line no-unused-vars
    componentDidUpdate(previousState) {}
  };

  function createBeforeRenderAdvice() {
    return function(firstRender) {
      const context = this;
      if (firstRender) {
        context.componentWillRender(this.state);
      } else {
        context.componentWillUpdate(this.state, clone(privates(context).renderedState));
      }
    };
  }

  function createAfterRenderAdvice() {
    return function(firstRender) {
      const context = this;
      const previousState = privates(context).renderedState;
      privates(context).renderedState = privates(context).state;
      if (firstRender) {
        context.componentDidRender(previousState);
      } else {
        context.componentDidUpdate(previousState);
      }
    };
  }
};
