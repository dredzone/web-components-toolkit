/*  */
import {Map} from './map.helper';
import {window} from './constants';

export const Set = window.Set || function () {
	const m = new Map();
	const set = m.set;
	delete m.get;
	delete m.set;
	m.add = obj => set.call(m, obj, obj);
	return m;
};
