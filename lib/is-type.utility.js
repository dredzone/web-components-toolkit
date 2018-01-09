/*  */
import {setApi} from './is.helpers';
import {} from './types';

export const isType = (function () {
	const is = {};

	const toString = Object.prototype.toString;
	const types = 'Array Object String Date RegExp Function Boolean Number Null Undefined Arguments Error'.split(' ');
	const typeCache = {};
	const typeRegexp = /\s([a-zA-Z]+)/;

	const getType = (obj) => {
		let type = toString.call(obj);
		if (!typeCache[type]) {
			let matches = type.match(typeRegexp);
			if (Array.isArray(matches) && matches.length > 1) {
				typeCache[type] = matches[1].toLowerCase();
			}
		}
		return typeCache[type];
	};

	for (let i = types.length; i--;) {
		let type = types[i].toLowerCase();
		is[type] = obj => getType(obj) === type;
	}

	is.domNode = (obj) => Boolean(is.object(obj) && obj.nodeType > 0);
	return setApi(is);
})();

