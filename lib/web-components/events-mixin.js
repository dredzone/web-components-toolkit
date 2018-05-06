/*  */
import after from '../advice/after.js';
import createStorage from '../create-storage.js';
import listenEvent, {} from '../dom/listen-event.js';



/**
 * Mixin adds CustomEvent handling to an element
 */
export default (baseClass) => {
	const {assign} = Object;
	const privates = createStorage(function () {
		return {
			handlers: []
		};
	});
	const eventDefaultParams = {
		bubbles: false,
		cancelable: false
	};

	return class Events extends baseClass {

		static finalizeClass() {
			super.finalizeClass();
			after(createDisconnectedAdvice(), 'disconnected')(this);
		}

		handleEvent(event) {
			const handle = `on${event.type}`;
			if (typeof this[handle] === 'function') {
				// $FlowFixMe
				this[handle](event);
			}
		}

		on(type, listener, capture) {
			this.own(listenEvent(this, type, listener, capture));
		}

		dispatch(type, data = {}) {
			this.dispatchEvent(new CustomEvent(type, assign(eventDefaultParams, {detail: data})));
		}

		off() {
			privates(this).handlers.forEach((handler) => {
				handler.remove();
			});
		}

		own(...handlers) {
			handlers.forEach((handler) => {
				privates(this).handlers.push(handler);
			});
		}
	};

	function createDisconnectedAdvice() {
		return function () {
			const context = this;
			context.off();
		};
	}
};
