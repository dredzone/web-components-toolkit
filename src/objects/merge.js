export const merge = (target: Object | Array, source: Object | Array, optionsArgument: Object): Object => {
	const sourceIsArray: boolean = Array.isArray(source);
	const targetIsArray: boolean = Array.isArray(target);
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

merge.all = (array: Array<Object>, optionsArgument: Object): Object => {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array');
	}

	return array.reduce((prev, next) => {
		return merge(prev, next, optionsArgument);
	}, {});
};

function isMergeableObject(value) {
	return isNonNullObject(value) && !isSpecial(value);
}

function isNonNullObject(value) {
	return value && typeof value === 'object';
}

function isSpecial(value) {
	const stringValue = Object.prototype.toString.call(value);
	return stringValue === '[object RegExp]' || stringValue === '[object Date]';
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {};
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
			destination[key] = merge(target[key], source[key], optionsArgument);
		}
	});

	return destination;
}
