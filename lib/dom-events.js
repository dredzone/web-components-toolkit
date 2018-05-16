/*  */
import { browser } from './environment.js';



export const listenEvent = browser((
	target,
	type,
	listener,
	capture = false
) => {
	return parse(target, type, listener, capture);
});

export const listenEventOnce = browser((
	target,
	type,
	listener,
	capture = false
) => {
	let handle = listenEvent(
		target,
		type, (...args) => {
			handle.remove();
			listener(...args);
		},
		capture
	);
	return handle;
});

export const pausableEvent = browser((
	target,
	type,
	listener,
	capture = false
) => {
	let paused = false;
	let handle = listenEvent(
		target,
		type,
		(...args) => {
			if (!paused) {
				listener(...args);
			}
		},
		capture
	);

	return {
		remove() {
			handle.remove();
		},
		pause() {
			paused = true;
		},
		resume() {
			paused = false;
		}
	};
});

export const stopEvent = browser((evt) => {
	if (evt.stopPropagation) {
		evt.stopPropagation();
	}
	evt.preventDefault();
});


function addListener(
	target,
	type,
	listener,
	capture
) {
	if (target.addEventListener) {
		target.addEventListener(type, listener, capture);
		return {
			remove: function() {
				this.remove = () => {};
				target.removeEventListener(type, listener, capture);
			}
		};
	}
	throw new Error('target must be an event emitter');
}

function parse(
	target,
	type,
	listener,
	capture
) {
	if (type.indexOf(',') > -1) {
		let events = type.split(/\s*,\s*/);
		let handles = events.map(function(type) {
			return addListener(target, type, listener, capture);
		});
		return {
			remove() {
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
