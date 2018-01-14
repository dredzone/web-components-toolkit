export const throttle: Function = (callback: Function, delay: number): Function => {
	let isThrottled: boolean = false;
	let args: Array<any> = null;

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
