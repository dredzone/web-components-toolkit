/* @flow */
import createStorage from '../create-storage.js';
import around from '../advice/around.js';
import microTask from '../dom/microtask.js';

const global: Object = document.defaultView;

// https://github.com/google/traceur-compiler/issues/1709
if (typeof global.HTMLElement !== 'function') {
	const _HTMLElement = function HTMLElement() { // eslint-disable-line func-names

	};
	_HTMLElement.prototype = global.HTMLElement.prototype;
	global.HTMLElement = _HTMLElement;
}

export interface ICustomElement {
	static observedAttributes: string[];

	static finalizeClass(): void;

	static define(tagName: string): void;

	/**
	 * Called during creation time,
	 * subclasses extend override this, and should not use `constructor`
	 */
	construct(): void;

	isConnected(): boolean;

	/**
	 * Called when an observed attribute has been added, removed, updated, or replaced.
	 * Also called for initial values when an element is created by the parser, or upgraded.
	 * Note: only attributes listed in the observedAttributes property will receive this callback.
	 */
	// attributeChangedCallback(attributeName: string, oldValue: string, newValue: string): void;
	attributeChanged(attributeName: string, oldValue: string, newValue: string): void;

	/**
	 * Called every time the element is inserted into the DOM.
	 * Useful for running setup code, such as fetching resources or rendering.
	 * Generally, you should try to delay work until this time.
	 */
	// connectedCallback(): void;
	connected(): void;

	/**
	 * Called every time the element is removed from the DOM. Useful for running clean up code.
	 */
	disconnected(): void;

	/**
	 * The custom element has been moved into a new document (e.g. someone called document.adoptNode(el)).
	 */
	// adoptedCallback(): void;
	adopted(): void;

	render(): void;

	_onRender(firstRender: boolean): void;

	_postRender(firstRender: boolean): void;
}

export default (baseClass?: Class<HTMLElement>): Class<HTMLElement & ICustomElement> => {
	const customElementsV1Callbacks: Array<string> = [
		'connectedCallback',
		'disconnectedCallback',
		'adoptedCallback',
		'attributeChangedCallback'
	];
	const {defineProperty, hasOwnProperty} = Object;
	const privates: Function = createStorage();

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
			return privates(this).initialized === true;
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
			privates(context).connected = true;
			if (!privates(context).initialized) {
				privates(context).initialized = true;
				connectedCallback.call(context);
				context.render();
			}
		};
	}

	function createRenderAdvice(): Function {
		return function (renderCallback: Function) {
			const context: ICustomElement = this;
			if (!privates(context).rendering) {
				const firstRender: boolean = privates(context).rendering === undefined;
				privates(context).rendering = true;
				microTask.run(() => {
					if (privates(context).rendering) {
						privates(context).rendering = false;
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
			privates(context).connected = false;
			microTask.run(() => {
				if (!privates(context).connected && privates(context).initialized) {
					privates(context).initialized = false;
					disconnectedCallback.call(context);
				}
			});
		};
	}
};
