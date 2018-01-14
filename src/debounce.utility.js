export const debounce: Function = (callback: Function, delay: number): Function => {
	let timer: ?number;

	return function (...args: Array<any>) {
		clearTimeout(timer);
		timer = setTimeout(function () {
			timer = null;
			callback(...args);
		}, delay);
	};
};
