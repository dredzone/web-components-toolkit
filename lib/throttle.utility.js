/*  */
export const throttle = (callback, delay) => {
	let isThrottled = false;
	let args = null;

	function wrapper(...params) {
		if (isThrottled) {
			args = params;
			return;
		}

		isThrottled = true;
		callback(...params);

		setTimeout(() => {
			isThrottled = false;
			if (args) {
				wrapper(...args);
				args = null;
			}
		}, delay);
	}

	return wrapper;
};
