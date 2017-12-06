/* @flow */
import {uniqueId} from './unique-id';
import {mix} from './mix';
import {typeChecks} from './type.checks';

/**
 * Normalize HTMLElement behaviour between browsers
 *
 * */
export const NormalizedHTMLElement = (function (Ctor: Class<HTMLElement>): Class<any> {
	if (typeChecks.function(Ctor)) {
		return Ctor;
	}
	let baseElement = function() {};
	baseElement.prototype = document.createElement('div');
	return baseElement;
})(HTMLElement);

export class CustomElement extends HTMLElement {
	static get is(): string {
		return this.name
			.replace(/([a-z\d])([A-Z])/g, '$1-$2')
			.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1-$2')
			.toLowerCase();
	}

	static create(attributes: {[key: string]: string}): HTMLElement {
		attributes = attributes || {};
		let element = document.createElement(this.is);
		Object.keys(attributes).forEach(key => {
			element.setAttribute(key, attributes[key]);
		});
		return element;
	}

	static define(): Class<CustomElement> {
		if (typeChecks.undefined(customElements)) {
			throw new Error('CustomElements V1 support is required!!!');
		}
		const Class = this;
		const registry = customElements;

		if (!registry.get(Class.is)) {
			registry.define(Class.is, Class);
		}
		return Class;
	}

	/**
	 * Mixin one or more mixin-classes
	 *
	 * ```javascript
	 *  class MyComponent extends Component.mix(A, B, C) {}
	 * ```
	 *
	 * The mixins are applied in order to the superclass, so the prototype chain
	 * will be: MyComponent->A->B->C->Component.
	 *
	 * @param {Array.<Function>} mixins
	 * @return {Function} A component with mixins applied
	 */
	static mix(...mixins: Array<Function>): Class<CustomElement> {
		return mix(this).with(...mixins);
	}

	/**
	 * the mandatory `super()` call
	 * will return the right context/instance to use
	 * and eventually return
	 *
	 * @constructor
	 * @return {HTMLElement} self - upgraded instance
	 */
	constructor(element: HTMLElement) {
		element = super(element); // upgrade
		// return is important in case instance created procedurally:
		// let me = new MyElement();
		return initElement(element);
	}
}

function initElement(element: HTMLElement): HTMLElement {
	if (!element.hasAttribute('id')) {
		element.setAttribute('id', String(uniqueId()));
	}
	element.setAttribute('defined', '');
	return element; // for chaining
}
