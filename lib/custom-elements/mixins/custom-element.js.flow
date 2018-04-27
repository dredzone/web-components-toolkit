/* @flow */
import around from '../../advice/around';
import microTask from '../microtask';
import type {ICustomElement} from '../../interfaces';

const global: Object = document.defaultView;

// https://github.com/google/traceur-compiler/issues/1709
if (typeof global.HTMLElement !== 'function') {
	const _HTMLElement = function HTMLElement() { // eslint-disable-line func-names

	};
	_HTMLElement.prototype = global.HTMLElement.prototype;
	global.HTMLElement = _HTMLElement;
}

export default (baseClass?: Class<HTMLElement>): Class<HTMLElement & ICustomElement> => {
	const customElementsV1Callbacks: Array<string> = [
		'connectedCallback',
		'disconnectedCallback',
		'adoptedCallback',
		'attributeChangedCallback'
	];
	const {defineProperty, hasOwnProperty} = Object;
	const connectedKeySymbol: Symbol = Symbol('connected');
	const initializedKeySymbol: Symbol = Symbol('initialized');
	const renderingKeySymbol: Symbol = Symbol('rendering');

	if (!baseClass) {
		baseClass = class extends global.HTMLElement {};
	}

	return class CustomElement extends baseClass implements ICustomElement {
		$key: any;
		$value: any;

		static get observedAttributes(): Array<string> {
			return [];
		}

		static finalizeClass(): void {

		}

		static define(tagName: string): void {
			const registry: CustomElementRegistry = customElements;
			if (!registry.get(tagName)) {
				const proto: any = this.prototype;
				customElementsV1Callbacks.forEach((callbackMethodName: string) => {
					if (!hasOwnProperty.call(proto, callbackMethodName)) {
						defineProperty(proto, callbackMethodName, {
							value() {},
							configurable: true
						});
					}
					const newCallbackName: string = callbackMethodName.substring(0, (callbackMethodName.length - 'callback'.length));
					const originalMethod: Function = proto[callbackMethodName];
					defineProperty(proto, callbackMethodName, {
						value: function (...args) {
							this[newCallbackName].apply(this, args);
							originalMethod.apply(this, args);
						},
						configurable: true
					});
				});

				this.finalizeClass();
				around(createConnectedAdvice(), 'connected')(this);
				around(createDisconnectedAdvice(), 'disconnected')(this);
				around(createRenderAdvice(), 'render')(this);
				registry.define(tagName, this);
			}
		}

		constructor(...args: Array<any>) {
			super(...args);
			this.construct();
		}

		construct(): void {

		}

		isConnected(): boolean {
			return this[initializedKeySymbol] === true;
		}

		/* eslint-disable no-unused-vars */
		attributeChanged(attributeName: string, oldValue: string, newValue: string): void {

		}
		/* eslint-enable no-unused-vars */

		connected(): void {

		}

		disconnected(): void {

		}

		adopted(): void {

		}

		render(): void {

		}

		_onRender(): void {

		}

		_postRender(): void {

		}
	};

	function createConnectedAdvice(): Function {
		return function (connectedCallback: Function) {
			const context: ICustomElement = this;
			context[connectedKeySymbol] = true;
			if (context[initializedKeySymbol] !== true) {
				context[initializedKeySymbol] = true;
				connectedCallback.call(context);
				context.render();
			}
		};
	}

	function createRenderAdvice(): Function {
		return function (renderCallback: Function) {
			const context: ICustomElement = this;
			if (context[renderingKeySymbol] !== true) {
				const firstRender: boolean = context[renderingKeySymbol] === undefined;
				context[renderingKeySymbol] = true;
				microTask.run(() => {
					if (context[renderingKeySymbol]) {
						context[renderingKeySymbol] = false;
						context._onRender(firstRender);
						renderCallback.call(context);
						context._postRender(firstRender);
					}
				});
			}
		};
	}

	function createDisconnectedAdvice(): Function {
		return function (disconnectedCallback: Function) {
			const context: ICustomElement = this;
			context[connectedKeySymbol] = false;
			microTask.run(() => {
				if (!context[connectedKeySymbol] && context[initializedKeySymbol]) {
					context[initializedKeySymbol] = false;
					disconnectedCallback.call(context);
				}
			});
		};
	}
};
