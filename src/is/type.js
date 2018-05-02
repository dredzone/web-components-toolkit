/* @flow */
import {type IsApi, default as api} from './api';

export type IsType = {
	array: Function;
	object: Function;
	string: Function;
	date: Function;
	regexp: Function;
	function: Function;
	boolean: Function;
	number: Function;
	null: Function;
	undefined: Function;
	arguments: Function;
	error: Function
};

const toString: Function = Object.prototype.toString;
const types: string[] = 'Array Object String Date RegExp Function Boolean Number Null Undefined Arguments Error'.split(' ');
const len: number = types.length;
const typeCache: Object = {};
const typeRegexp: RegExp = /\s([a-zA-Z]+)/;
const typeCheck: IsApi<IsType> = api(setupTypeChecks());

export default typeCheck;

function getType(obj: any): string {
	let type = toString.call(obj);
	if (!typeCache[type]) {
		let matches: any = type.match(typeRegexp);
		if (Array.isArray(matches) && matches.length > 1) {
			typeCache[type] = matches[1].toLowerCase();
		}
	}
	return typeCache[type];
}

function setupTypeChecks(): IsType {
	let checks: Object = {};
	for (let i = len; i--;) {
		const type: string = types[i].toLowerCase();
		checks[type] = obj => getType(obj) === type;
	}
	return checks;
}
