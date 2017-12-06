/* @flow */
import {typeChecks} from './type.checks';

export const deepMerge = (target: any, source: any, optionsArgument: Object): Object | Array<any> => {
	const sourceIsArray: boolean = typeChecks.array(source);
	const targetIsArray: boolean = typeChecks.array(target);
	const options: Object = optionsArgument || {
		arrayMerge: defaultArrayMerge
	};
	const sourceAndTargetTypesMatch: boolean = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, optionsArgument);
	} else if (sourceIsArray) {
		let arrayMerge: Function = options.arrayMerge || defaultArrayMerge;
		return arrayMerge(target, source, optionsArgument);
	}
	return mergeObject(target, source, optionsArgument);
};

deepMerge.all = (array: Array<any>, optionsArgument: Object): Object | Array<any> => {
	if (typeChecks.not.array(array)) {
		throw new Error('first argument should be an array');
	}

	return array.reduce((prev, next) => {
		return deepMerge(prev, next, optionsArgument);
	}, {});
};

function isMergeableObject(value: any): boolean {
	return isNonNullObject(value) && !isSpecial(value);
}

function isNonNullObject(value: any): boolean {
	return value && typeChecks.object(value);
}

function isSpecial(value: any): boolean {
	return typeChecks.regexp(value) || typeChecks.date(value);
}

function emptyTarget(val: any): Object | Array<[]> {
	return typeChecks.array(val) ? [] : {};
}

function cloneUnlessOtherwiseSpecified(value: any, optionsArgument: Object): any {
	const clone = !optionsArgument || optionsArgument.clone !== false;
	return (clone && isMergeableObject(value)) ? deepMerge(emptyTarget(value), value, optionsArgument) : value;
}

function defaultArrayMerge(target: Array<any>, source: Array<any>, optionsArgument: Object): Array<any> {
	return target.concat(source).map(element => {
		return cloneUnlessOtherwiseSpecified(element, optionsArgument);
	});
}

function mergeObject(target: any, source: any, optionsArgument: Object): Object {
	let destination = {};
	if (isMergeableObject(target)) {
		Object.keys(target).forEach(key => {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], optionsArgument);
		});
	}
	Object.keys(source).forEach(key => {
		if (!isMergeableObject(source[key]) || !target[key]) {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], optionsArgument);
		} else {
			destination[key] = deepMerge(target[key], source[key], optionsArgument);
		}
	});

	return destination;
}
