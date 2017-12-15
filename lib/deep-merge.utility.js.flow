/* @flow */
import {isType} from './is-type.utility';

export const deepMerge = (target: any, source: any, optionsArgument: Object): Object | Array<any> => {
	const sourceIsArray: boolean = isType.array(source);
	const targetIsArray: boolean = isType.array(target);
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
	if (isType.not.array(array)) {
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
	return value && isType.object(value);
}

function isSpecial(value: any): boolean {
	return isType.regexp(value) || isType.date(value);
}

function emptyTarget(val: any): Object | Array<[]> {
	return isType.array(val) ? [] : {};
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
