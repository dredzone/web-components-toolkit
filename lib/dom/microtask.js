/*  */
let currHandle = 0;
let lastHandle = 0;
let callbacks = [];
let nodeContent = 0;
let node = document.createTextNode('');
new MutationObserver(flush).observe(node, { characterData: true });

/**
 * Enqueues a function called at  timing.
 *
 * @param {Function} callback Callback to run
 * @return {number} Handle used for canceling task
 */
export const run = (callback) => {
  node.textContent = String(nodeContent++);
  callbacks.push(callback);
  return currHandle++;
};

/**
 * Cancels a previously enqueued `` callback.
 *
 * @param {number} handle Handle returned from `run` of callback to cancel
 */
export const cancel = (handle) => {
  const idx = handle - lastHandle;
  if (idx >= 0) {
    if (!callbacks[idx]) {
      throw new Error('invalid async handle: ' + handle);
    }
    callbacks[idx] = null;
  }
};

function flush() {
  const len = callbacks.length;
  for (let i = 0; i < len; i++) {
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
