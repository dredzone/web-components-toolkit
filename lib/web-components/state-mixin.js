/*  */
import after from '../advice/after';



export default (baseClass) => {
	const stateSymbol = Symbol('state');
	const renderedStateSymbol = Symbol('renderedState');
	const {assign} = Object;

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
			return this[stateSymbol];
		}

		shouldComponentUpdate(nextState) {
			for (let key in nextState) {
				if (nextState[key] !== this.state[key]) {
					return true;
				}
			}
			return false;
		}

		setState(changes) {
			const nextState = assign({}, this.state, changes);
			const previousState = this.state;
			const changed = previousState === undefined || this.shouldComponentUpdate(nextState);

			if (changed) {
				this[stateSymbol] = nextState;
				if (this.isConnected()) {
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
				context.componentWillRender(context[stateSymbol]);
			} else {
				context.componentWillUpdate(context[stateSymbol], context[renderedStateSymbol]);
			}
		};
	}

	function createAfterRenderAdvice() {
		return function (firstRender) {
			const context = this;
			const previousState = context[renderedStateSymbol];
			context[renderedStateSymbol] = context[stateSymbol];
			if (firstRender) {
				context.componentDidRender(previousState);
			} else {
				context.componentDidUpdate(previousState);
			}
		};
	}
};
