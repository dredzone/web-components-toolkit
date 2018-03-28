/* @flow */
import {global} from './global-scope.utility';

let microTaskCurrHandle: number = 0;
let microTaskLastHandle: number = 0;
let microTaskCallbacks: Array<mixed> = [];
let microTaskNodeContent: number = 0;
let microTaskNode: Text = document.createTextNode('');
new global.MutationObserver(microTaskFlush).observe(microTaskNode, {characterData: true});

/**
 * Based on Polymer.async
 */
export const microTask = {
	/**
	 * Enqueues a function called at microTask timing.
	 *
	 * @param {Function} callback Callback to run
	 * @return {number} Handle used for canceling task
	 */
	run(callback: Function): number {
		microTaskNode.textContent = String(microTaskNodeContent++);
		microTaskCallbacks.push(callback);
		return microTaskCurrHandle++;
	},

	/**
	 * Cancels a previously enqueued `microTask` callback.
	 *
	 * @param {number} handle Handle returned from `run` of callback to cancel
	 */
	cancel(handle: number): void {
		const idx = handle - microTaskLastHandle;
		if (idx >= 0) {
			if (!microTaskCallbacks[idx]) {
				throw new Error('invalid async handle: ' + handle);
			}
			microTaskCallbacks[idx] = null;
		}
	}
};

function microTaskFlush() {
	const len: number = microTaskCallbacks.length;
	for (let i = 0; i < len; i++) {
		let cb = microTaskCallbacks[i];
		if (cb && typeof cb === 'function') {
			try {
				cb();
			} catch (err) {
				setTimeout(() => {
					throw err;
				});
			}
		}
	}
	microTaskCallbacks.splice(0, len);
	microTaskLastHandle += len;
}
