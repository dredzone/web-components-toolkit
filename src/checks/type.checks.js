import {checksHelper} from './checks.helper';

export const typeChecks = (function () {
	const checks = {
		not: {},
		all: {},
		any: {}
	};

	const toString = Object.prototype.toString;
	const types = 'Array Object String Date RegExp Function Boolean Number Null Undefined Arguments Error'.split(' ');
	const typeCache = {};
	const typeRegexp = /\s([a-zA-Z]+)/;

	const getType = (obj: any): string => {
		let type = toString.call(obj);
		if (!typeCache[type]) {
			typeCache[type] = type.match(typeRegexp)[1].toLowerCase();
		}
		return typeCache[type];
	};

	for (let i = types.length; i--;) {
		let type = types[i].toLowerCase();
		checks[type] = obj => getType(obj) === type;
	}

	checks.domNode = (obj: any) => Boolean(checks.object(obj) && obj.nodeType > 0);

	checksHelper.setApi(checks);
	return checks;
})();

