/*  */

export const objectAssign = function (target, ...sources) {
	let to = Object(target);
	for (let i = 0; i < sources.length; i++) {
		if (isNotNextSource(sources[i])) {
			continue;
		}
		let nextSource = sources[i];
		for (let key in nextSource) {
			if (Object.prototype.hasOwnProperty.call(nextSource, key)) {
				let desc = Object.getOwnPropertyDescriptor(nextSource, key);
				if (desc && desc.enumerable) {
					to[key] = nextSource[key];
				}
			}
		}
	}
	return to;
};

function isNotNextSource(source) {
	return Boolean(typeof source === 'undefined' || source === null);
}
