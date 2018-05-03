/* @flow */
import listenEvent, {type EventHandler} from './listen-event';

export default (target: EventTarget, type: string, listener: Function, capture: boolean = false): EventHandler => {
	let handle: EventHandler = listenEvent(target, type, (...args: Array<any>) => {
		handle.remove();
		listener(...args);
	}, capture);
	return handle;
};
