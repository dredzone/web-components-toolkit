/*  */
import listenEvent, {} from './listen-event.js';

export default (target, type, listener, capture = false) => {
	let handle = listenEvent(target, type, (...args) => {
		handle.remove();
		listener(...args);
	}, capture);
	return handle;
};
