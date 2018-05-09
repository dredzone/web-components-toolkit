/*  */



const toString = Object.prototype.toString;
const types = 'Array Object String Date RegExp Function Boolean Number Null Undefined Arguments Error'.split(' ');
const len = types.length;
const typeCache = {};
const typeRegexp = /\s([a-zA-Z]+)/;
const is = setup();
export default is;

function setup() {
	let checks = {};
	for (let i = len; i--;) {
		const type = types[i].toLowerCase();
		checks[type] = obj => getType(obj) === type;
		checks[type].all = all(checks[type]);
		checks[type].any = any(checks[type]);
	}
	return checks;
}

function getType(obj) {
	let type = toString.call(obj);
	if (!typeCache[type]) {
		let matches = type.match(typeRegexp);
		if (Array.isArray(matches) && matches.length > 1) {
			typeCache[type] = matches[1].toLowerCase();
		}
	}
	return typeCache[type];
}

function all(fn) {
	return (...params) => {
		const len = params.length;
		for (let i = 0; i < len; i++) {
			if (!fn(params[i])) {
				return false;
			}
		}
		return true;
	};
}

function any(fn) {
	return (...params) => {
		const len = params.length;
		for (let i = 0; i < len; i++) {
			if (fn(params[i])) {
				return true;
			}
		}
		return false;
	};
}
