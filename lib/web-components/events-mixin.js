/*  */
import after from '../advice/after';
import listenEvent, {} from '../dom/listen-event';



/**
 * Mixin adds CustomEvent handling to an element
 */
export default (baseClass) => {
	const eventsHandlersSymbol = Symbol('eventsHandlers');
	const {assign} = Object;

	const eventDefaultParams = {
		bubbles: false,
		cancelable: false
	};

	return class Events extends baseClass {

		static finalizeClass() {
			super.finalizeClass();
			after(createDisconnectedAdvice(), 'disconnected')(this);
		}

		construct() {
			super.construct();
			// $FlowFixMe
			this[eventsHandlersSymbol] = [];
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
			this[eventsHandlersSymbol].forEach((handler) => {
				handler.remove();
			});
			this[eventsHandlersSymbol] = [];
		}

		own(...handlers) {
			handlers.forEach((handler) => {
				this[eventsHandlersSymbol].push(handler);
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
