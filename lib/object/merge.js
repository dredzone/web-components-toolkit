/*  */
import is from '../is';

const merge = (target, source, optionsArgument) => {
	const sourceIsArray = is.array(source);
	const targetIsArray = is.array(target);
	const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
	const options = optionsArgument || {
		arrayMerge: defaultArrayMerge
	};

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, optionsArgument);
	} else if (sourceIsArray) {
		let arrayMerge = options.arrayMerge || defaultArrayMerge;
		return arrayMerge(target, source, optionsArgument);
	}
	return objectsMerge(target, source, optionsArgument);
};

export const all = (array, optionsArgument) => {
	if (!is.array(array)) {
		throw new Error('first argument should be an array');
	}

	return array.reduce((prev, next) => {
		return merge(prev, next, optionsArgument);
	}, {});
};

export default merge;

function isMergeableObject(value) {
	return isNonNullObject(value) && !isSpecial(value);
}

function isNonNullObject(value) {
	return value && is.object(value);
}

function isSpecial(value) {
	return is.regexp(value) || is.date(value);
}

function emptyTarget(val) {
	return is.array(val) ? [] : {};
}

function cloneUnlessOtherwiseSpecified(value, optionsArgument) {
	const clone = !optionsArgument || optionsArgument.clone !== false;
	return (clone && isMergeableObject(value)) ? merge(emptyTarget(value), value, optionsArgument) : value;
}

function defaultArrayMerge(target, source, optionsArgument) {
	return target.concat(source).map(element => {
		return cloneUnlessOtherwiseSpecified(element, optionsArgument);
	});
}

function objectsMerge(target, source, optionsArgument) {
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
			destination[key] = merge(target[key], source[key], optionsArgument);
		}
	});

	return destination;
}