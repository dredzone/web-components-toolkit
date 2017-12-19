export const debounce = (callback, delay) => {
	let timer;

	return function (...args) {
		clearTimeout(timer);
		timer = setTimeout(function () {
			timer = null;
			callback(...args);
		}, delay);
	};
};
