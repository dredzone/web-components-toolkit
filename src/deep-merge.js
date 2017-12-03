import {typeChecks} from './type.checks';

export const deepMerge = (target: Object | Array, source: Object | Array, optionsArgument: Object): Object => {
	const sourceIsArray: boolean = typeChecks.array(source);
	const targetIsArray: boolean = typeChecks.array(target);
	const options: Object = optionsArgument || {
		arrayMerge: defaultArrayMerge
	};
	const sourceAndTargetTypesMatch: boolean = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, optionsArgument);
	} else if (sourceIsArray) {
		let arrayMerge = options.arrayMerge || defaultArrayMerge;
		return arrayMerge(target, source, optionsArgument);
	}
	return mergeObject(target, source, optionsArgument);
};

deepMerge.all = (array: Array<Object>, optionsArgument: Object): Object => {
	if (typeChecks.not.array(array)) {
		throw new Error('first argument should be an array');
	}

	return array.reduce((prev, next) => {
		return deepMerge(prev, next, optionsArgument);
	}, {});
};

function isMergeableObject(value) {
	return isNonNullObject(value) && !isSpecial(value);
}

function isNonNullObject(value) {
	return value && typeChecks.object(value);
}

function isSpecial(value) {
	return typeChecks.regexp(value) || typeChecks.date(value);
}

function emptyTarget(val) {
	return typeChecks.array(val) ? [] : {};
}

function cloneUnlessOtherwiseSpecified(value, optionsArgument) {
	const clone = !optionsArgument || optionsArgument.clone !== false;
	return (clone && isMergeableObject(value)) ? deepMerge(emptyTarget(value), value, optionsArgument) : value;
}

function defaultArrayMerge(target, source, optionsArgument) {
	return target.concat(source).map(element => {
		return cloneUnlessOtherwiseSpecified(element, optionsArgument);
	});
}

function mergeObject(target, source, optionsArgument) {
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
