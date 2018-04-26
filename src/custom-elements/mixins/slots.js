/* @flow */
import before from '../../advice/before';
import elementChildren from '../../dom/element-children';
import {type ICustomElement, type ISlots} from '../../interfaces';
import {type SlotsData} from '../../types';

export default (baseClass: Class<HTMLElement & ICustomElement>): Class<HTMLElement & ICustomElement> => {
	return class Slots extends baseClass implements ISlots {
		slots: SlotsData;

		static finalizeClass(): void {
			super.finalizeClass();
			before(createBeforeRenderAdvice(), '_onRender')(this);
		}

		construct() {
			super.construct();
			this.slots = {default: []};
		}

		slotsAssigned(): void {

		}
	};

	function createBeforeRenderAdvice(): Function {
		const hypenRegEx: RegExp = /-([a-z])/g;

		return function (firstRender: boolean): void {
			const context: HTMLElement & ISlots = this;
			if (firstRender) {
				const children: Array<Element> = elementChildren(context);
				children.forEach((child: Element) => {
					const attribute: mixed = child.getAttribute ? child.getAttribute('slot') : null;
					if (typeof attribute === 'string' && attribute.length > 0) {
						const slot = attribute.replace(hypenRegEx, match => match[1].toUpperCase());
						context.slots[slot] = child;
					} else {
						context.slots.default.push(child);
					}
				});
				context.slotsAssigned();
			}
		};
	}
};
