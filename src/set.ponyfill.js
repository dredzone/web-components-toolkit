/* @flow */
import {Map} from './map.ponyfill';

export const Set = function (): Object {
	const m = new Map();
	const set = m.set;
	delete m.get;
	delete m.set;
	m.add = obj => set.call(m, obj, obj);
	return m;
};
