/* @flow */
let currHandle: number = 0;
let lastHandle: number = 0;
let callbacks: Array<Function | null> = [];
let nodeContent: number = 0;
let node: Text = document.createTextNode('');
new MutationObserver(flush).observe(node, { characterData: true });

/**
 * Enqueues a function called at  timing.
 *
 * @param {Function} callback Callback to run
 * @return {number} Handle used for canceling task
 */
export const run: Function = (callback: Function): number => {
  node.textContent = String(nodeContent++);
  callbacks.push(callback);
  return currHandle++;
};

/**
 * Cancels a previously enqueued `` callback.
 *
 * @param {number} handle Handle returned from `run` of callback to cancel
 */
export const cancel: Function = (handle: number): void => {
  const idx: number = handle - lastHandle;
  if (idx >= 0) {
    if (!callbacks[idx]) {
      throw new Error('invalid async handle: ' + handle);
    }
    callbacks[idx] = null;
  }
};

function flush() {
  const len: number = callbacks.length;
  for (let i: number = 0; i < len; i++) {
    let cb = callbacks[i];
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
  callbacks.splice(0, len);
  lastHandle += len;
}
