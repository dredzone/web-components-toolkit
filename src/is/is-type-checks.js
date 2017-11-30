import {setApi} from './helpers';

export const isTypeChecks = (function() {
	const is = {
		not: {},
		any: {}
	};
	const toString = Object.prototype.toString;
	const types = 'Array Object String Date RegExp Function Boolean Number Null Undefined'.split(' ');
	const typeCache = {};
	const typeRegexp = /\s([a-zA-Z]+)/;

	const getType = (obj: any): string => {
		let type = toString.call(obj);
		return typeCache[type] || (typeCache[type] = type.match(typeRegexp)[1].toLowerCase());
	};

	for (let i = types.length; i--;) {
		let type = types[i].toLowerCase();
		is[types[i]] = obj => getType(obj) === type;
	}

	return setApi(is);
})();

