/*  */
import before from '../advice/before';
import elementChildren from '../dom/element-children';




export default (baseClass) => {
	return class Slots extends baseClass {

		static finalizeClass() {
			super.finalizeClass();
			before(createBeforeRenderAdvice(), '_onRender')(this);
		}

		construct() {
			super.construct();
			this.slots = {default: []};
		}

		slotsAssigned() {

		}
	};

	function createBeforeRenderAdvice() {
		const hypenRegEx = /-([a-z])/g;

		return function (firstRender) {
			const context = this;
			if (firstRender) {
				const children = elementChildren(context);
				children.forEach((child) => {
					const attribute = child.getAttribute ? child.getAttribute('slot') : null;
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
