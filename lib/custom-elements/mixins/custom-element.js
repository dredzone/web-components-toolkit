/*  */
import around from '../../functions/advice/around';
import microTask from '../microtask';

const global = document.defaultView;

// https://github.com/google/traceur-compiler/issues/1709
if (typeof global.HTMLElement !== 'function') {
	const _HTMLElement = function HTMLElement() { // eslint-disable-line func-names

	};
	_HTMLElement.prototype = global.HTMLElement.prototype;
	global.HTMLElement = _HTMLElement;
}


export default (baseClass) => {
	const customElementsV1Callbacks = [
		'connectedCallback',
		'disconnectedCallback',
		'adoptedCallback',
		'attributeChangedCallback'
	];
	const {defineProperty, hasOwnProperty} = Object;
	const connectedKeySymbol = Symbol('connected');
	const initializedKeySymbol = Symbol('initialized');
	const renderingKeySymbol = Symbol('rendering');

	if (!baseClass) {
		baseClass = class extends global.HTMLElement {};
	}

	return class CustomElement extends baseClass {

		static get observedAttributes() {
			return [];
		}

		static finalizeClass() {

		}

		static define(tagName) {
			const registry = customElements;
			if (!registry.get(tagName)) {
				const proto = this.prototype;
				customElementsV1Callbacks.forEach((callbackMethodName) => {
					if (!hasOwnProperty.call(proto, callbackMethodName)) {
						defineProperty(proto, callbackMethodName, {
							value() {},
							configurable: true
						});
					}
					const newCallbackName = callbackMethodName.substring(0, (callbackMethodName.length - 'callback'.length));
					const originalMethod = proto[callbackMethodName];
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

		constructor(...args) {
			super(...args);
			this.construct();
		}

		construct() {

		}

		isConnected() {
			return this[initializedKeySymbol] === true;
		}

		/* eslint-disable no-unused-vars */
		attributeChanged(attributeName, oldValue, newValue) {

		}
		/* eslint-enable no-unused-vars */

		connected() {

		}

		disconnected() {

		}

		adopted() {

		}

		render() {

		}

		_onRender() {

		}

		_postRender() {

		}
	};

	function createConnectedAdvice() {
		return function (connectedCallback) {
			const context = this;
			context[connectedKeySymbol] = true;
			if (context[initializedKeySymbol] !== true) {
				context[initializedKeySymbol] = true;
				connectedCallback.call(context);
				context.render();
			}
		};
	}

	function createRenderAdvice() {
		return function (renderCallback) {
			const context = this;
			if (context[renderingKeySymbol] !== true) {
				const firstRender = context[renderingKeySymbol] === undefined;
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

	function createDisconnectedAdvice() {
		return function (disconnectedCallback) {
			const context = this;
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
