/*  */
import { default as api} from './api';


const toString = Object.prototype.toString;
const types = 'Array Object String Date RegExp Function Boolean Number Null Undefined Arguments Error'.split(' ');
const len = types.length;
const typeCache = {};
const typeRegexp = /\s([a-zA-Z]+)/;
const typeCheck = api(setupTypeChecks());

export default typeCheck;

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

function setupTypeChecks() {
	let checks = {};
	for (let i = len; i--;) {
		const type = types[i].toLowerCase();
		checks[type] = obj => getType(obj) === type;
	}
	return checks;
}
