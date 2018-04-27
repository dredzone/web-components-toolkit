/* @flow */
import assign from 'lodash/assign';
import after from '../../advice/after';
import type {ICustomElement, IState} from '../../interfaces';

type InType = HTMLElement & ICustomElement;
type OutType = InType & IState;

export default (baseClass: Class<InType>): Class<OutType> => {
	const stateSymbol: Symbol = Symbol('state');
	const renderedStateSymbol: Symbol = Symbol('renderedState');

	return class State extends baseClass implements IState {
		$key: any;
		$value: any;

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
			return this[stateSymbol];
		}

		shouldComponentUpdate(nextState: Object): boolean {
			for (let key in nextState) {
				if (nextState[key] !== this.state[key]) {
					return true;
				}
			}
			return false;
		}

		setState(changes: Object): void {
			const nextState: Object = assign({}, this.state, changes);
			const previousState: Object = this.state;
			const changed = previousState === undefined || this.shouldComponentUpdate(nextState);

			if (changed) {
				this[stateSymbol] = nextState;
				if (this.isConnected()) {
					this.render();
				}
			}
		}

		componentWillRender(newState: Object): void { // eslint-disable-line no-unused-vars

		}

		componentDidRender(previousState: Object): void { // eslint-disable-line no-unused-vars

		}

		componentWillUpdate(newState: Object, previousState: Object): void { // eslint-disable-line no-unused-vars

		}

		componentDidUpdate(previousState: Object): void { // eslint-disable-line no-unused-vars

		}
	};

	function createBeforeRenderAdvice(): Function {
		return function (firstRender: boolean): void {
			const context: IState = this;
			if (firstRender) {
				context.componentWillRender(context[stateSymbol]);
			} else {
				context.componentWillUpdate(context[stateSymbol], context[renderedStateSymbol]);
			}
		};
	}

	function createAfterRenderAdvice(): Function {
		return function (firstRender: boolean): void {
			const context: IState = this;
			const previousState: Object = context[renderedStateSymbol];
			context[renderedStateSymbol] = context[stateSymbol];
			if (firstRender) {
				context.componentDidRender(previousState);
			} else {
				context.componentDidUpdate(previousState);
			}
		};
	}
};
