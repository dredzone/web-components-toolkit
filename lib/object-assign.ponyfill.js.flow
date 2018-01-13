/* @flow */
import type {PropertyDescriptorType} from './types';

export const objectAssign: Function = Object.assign || function (target: Object, ...sources: Array<any>): Object {
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
