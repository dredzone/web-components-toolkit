/* @flow */
type PropertyDescriptorType = {
	configurable?: boolean;
	enumerable?: boolean;
	value?: any;
	writable?: boolean;
	get(): any;
	set(v: any): void;
};

export const objectAssign: Function = function (target: Object, ...sources: Array<any>): Object {
	if (Object.assign) {
		return Object.assign(target, ...sources);
	}
	let to = Object(target);
	for (let i = 0; i < sources.length; i++) {
		if (isNotNextSource(sources[i])) {
			continue;
		}
		let nextSource = sources[i];
		for (let key: string in nextSource) {
			if (Object.prototype.hasOwnProperty.call(nextSource, key)) {
				let desc: PropertyDescriptorType = Object.getOwnPropertyDescriptor(nextSource, key);
				if (desc && desc.enumerable) {
					to[key] = nextSource[key];
				}
			}
		}
	}
	return to;
};

function isNotNextSource(source: any) {
	return Boolean(typeof source === 'undefined' || source === null);
}
