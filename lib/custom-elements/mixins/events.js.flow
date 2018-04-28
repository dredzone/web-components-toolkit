/* @flow */
import after from '../../functions/advice/after';
import {default as on, type EventHandler} from '../on';
import type {ICustomElement} from './custom-element';

export interface IEvents {
	[key: string]: Function;

	handleEvent(evt: Event): void;

	on(type: string, listener: Function, capture: boolean): void;

	dispatch(type: string, data: Object): void;

	off(): void;

	own(...handlers: Array<EventHandler>): void;
}

type InType = HTMLElement & ICustomElement;
type OutType = InType & IEvents;

/**
 * Mixin adds CustomEvent handling to an element
 */
export default (baseClass: Class<InType>): Class<OutType> => {
	const eventsHandlersSymbol: Symbol = Symbol('eventsHandlers');
	const {assign} = Object;

	const eventDefaultParams: Object = {
		bubbles: false,
		cancelable: false
	};

	return class Events extends baseClass implements IEvents {
		$key: any;
		$value: any;

		static finalizeClass(): void {
			super.finalizeClass();
			after(createDisconnectedAdvice(), 'disconnected')(this);
		}

		construct() {
			super.construct();
			// $FlowFixMe
			this[eventsHandlersSymbol] = [];
		}

		handleEvent(event): void {
			const handle: string = `on${event.type}`;
			if (typeof this[handle] === 'function') {
				// $FlowFixMe
				this[handle](event);
			}
		}

		on(type: string, listener: Function, capture?: boolean): void {
			this.own(on(this, type, listener, capture));
		}

		dispatch(type: string, data: Object = {}): void {
			this.dispatchEvent(new CustomEvent(type, assign(eventDefaultParams, {detail: data})));
		}

		off(): void {
			this[eventsHandlersSymbol].forEach((handler: EventHandler) => {
				handler.remove();
			});
			this[eventsHandlersSymbol] = [];
		}

		own(...handlers: Array<EventHandler>): void {
			handlers.forEach((handler: EventHandler) => {
				this[eventsHandlersSymbol].push(handler);
			});
		}
	};

	function createDisconnectedAdvice(): Function {
		return function () {
			const context: IEvents = this;
			context.off();
		};
	}
};
