/*  */
import createStorage from '../create-storage.js';
import after from '../advice/after.js';



export default (baseClass) => {
	const {assign} = Object;
	const privates = createStorage();

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
			return assign({}, privates(this).state);
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
			const nextState = assign({}, privates(this).state, changes);
			const previousState = privates(this).state;
			const changed = previousState === undefined || this.shouldComponentUpdate(nextState);

			if (changed) {
				privates(this).state = nextState;
				if (this.initialized) {
					this.render();
				}
			}
		}

		componentWillRender(newState) { // eslint-disable-line no-unused-vars

		}

		componentDidRender(previousState) { // eslint-disable-line no-unused-vars

		}

		componentWillUpdate(newState, previousState) { // eslint-disable-line no-unused-vars

		}

		componentDidUpdate(previousState) { // eslint-disable-line no-unused-vars

		}
	};

	function createBeforeRenderAdvice() {
		return function (firstRender) {
			const context = this;
			if (firstRender) {
				context.componentWillRender(this.state);
			} else {
				context.componentWillUpdate(this.state, assign({}, privates(context).renderedState));
			}
		};
	}

	function createAfterRenderAdvice() {
		return function (firstRender) {
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
