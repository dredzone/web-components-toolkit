/* @flow */
export type EventHandler = {
	remove(): void;
}

export type PausableEventHandler = EventHandler & {
	pause(): void,
	resume(): void
}

const on: Function = (target: EventTarget, type: string, listener: Function, capture: boolean = false): EventHandler => {
	return parse(target, type, listener, capture);
};

on.once = function (target: EventTarget, type: string, listener: Function): EventHandler {
	let handle = on(target, type, () => {
		handle.remove();
		listener.apply(this, arguments);
	});
	return handle;
};

on.pausable = function (target: EventTarget, type: string, listener: Function, capture: boolean): PausableEventHandler {
	let paused;
	let handle: EventHandler = on(target, type, function () {
		if (!paused) {
			listener.apply(this, arguments);
		}
	}, capture);

	return {
		remove(): void {
			handle.remove();
		},
		pause(): void {
			paused = true;
		},
		resume(): void {
			paused = false;
		}
	};
};

export default on;

function addListener(target: HTMLElement, type: string, listener: Function, capture: boolean): EventHandler {
	if (target.addEventListener) {
		target.addEventListener(type, listener, capture);
		return {
			remove: function (): void {
				this.remove = () => {};
				target.removeEventListener(type, listener, capture);
			}
		};
	}
	throw new Error('target must be an event emitter');
}

function parse(target: Object | HTMLElement, type: string, listener: Function, capture: boolean): EventHandler {
	if (type.indexOf(',') > -1) {
		let events = type.split(/\s*,\s*/);
		let handles = events.map(function (type) {
			return addListener(target, type, listener, capture);
		});
		return {
			remove(): void {
				this.remove = () => {};
				let handle;
				while ((handle = handles.pop())) {
					handle.remove();
				}
			}
		};
	}
	return addListener(target, type, listener, capture);
}
