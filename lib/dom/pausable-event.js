/*  */
import listenEvent, {} from './listen-event';


export default (target, type, listener, capture = false) => {
	let paused = false;
	let handle = listenEvent(target, type, (...args) => {
		if (!paused) {
			listener(...args);
		}
	}, capture);

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
};
