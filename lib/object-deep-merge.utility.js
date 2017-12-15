/*  */
import {isType} from './is-type.utility';

export const objectDeepMerge = (target, source, optionsArgument) => {
	const sourceIsArray = isType.array(source);
	const targetIsArray = isType.array(target);
	const options = optionsArgument || {
		arrayMerge: defaultArrayMerge
	};
	const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, optionsArgument);
	} else if (sourceIsArray) {
		let arrayMerge = options.arrayMerge || defaultArrayMerge;
		return arrayMerge(target, source, optionsArgument);
	}
	return mergeObject(target, source, optionsArgument);
};

objectDeepMerge.all = (array, optionsArgument) => {
	if (isType.not.array(array)) {
		throw new Error('first argument should be an array');
	}

	return array.reduce((prev, next) => {
		return objectDeepMerge(prev, next, optionsArgument);
	}, {});
};

function isMergeableObject(value) {
	return isNonNullObject(value) && !isSpecial(value);
}

function isNonNullObject(value) {
	return value && isType.object(value);
}

function isSpecial(value) {
	return isType.regexp(value) || isType.date(value);
}

function emptyTarget(val) {
	return isType.array(val) ? [] : {};
}

function cloneUnlessOtherwiseSpecified(value, optionsArgument) {
	const clone = !optionsArgument || optionsArgument.clone !== false;
	return (clone && isMergeableObject(value)) ? objectDeepMerge(emptyTarget(value), value, optionsArgument) : value;
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
			destination[key] = objectDeepMerge(target[key], source[key], optionsArgument);
		}
	});

	return destination;
}
