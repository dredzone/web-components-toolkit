define(['exports', './type.checks'], function (exports, _type) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.deepMerge = undefined;
	var deepMerge = exports.deepMerge = function deepMerge(target, source, optionsArgument) {
		var sourceIsArray = _type.typeChecks.array(source);
		var targetIsArray = _type.typeChecks.array(target);
		var options = optionsArgument || {
			arrayMerge: defaultArrayMerge
		};
		var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

		if (!sourceAndTargetTypesMatch) {
			return cloneUnlessOtherwiseSpecified(source, optionsArgument);
		} else if (sourceIsArray) {
			var arrayMerge = options.arrayMerge || defaultArrayMerge;
			return arrayMerge(target, source, optionsArgument);
		}
		return mergeObject(target, source, optionsArgument);
	};

	deepMerge.all = function (array, optionsArgument) {
		if (_type.typeChecks.not.array(array)) {
			throw new Error('first argument should be an array');
		}

		return array.reduce(function (prev, next) {
			return deepMerge(prev, next, optionsArgument);
		}, {});
	};

	function isMergeableObject(value) {
		return isNonNullObject(value) && !isSpecial(value);
	}

	function isNonNullObject(value) {
		return value && _type.typeChecks.object(value);
	}

	function isSpecial(value) {
		return _type.typeChecks.regexp(value) || _type.typeChecks.date(value);
	}

	function emptyTarget(val) {
		return _type.typeChecks.array(val) ? [] : {};
	}

	function cloneUnlessOtherwiseSpecified(value, optionsArgument) {
		var clone = !optionsArgument || optionsArgument.clone !== false;
		return clone && isMergeableObject(value) ? deepMerge(emptyTarget(value), value, optionsArgument) : value;
	}

	function defaultArrayMerge(target, source, optionsArgument) {
		return target.concat(source).map(function (element) {
			return cloneUnlessOtherwiseSpecified(element, optionsArgument);
		});
	}

	function mergeObject(target, source, optionsArgument) {
		var destination = {};
		if (isMergeableObject(target)) {
			Object.keys(target).forEach(function (key) {
				destination[key] = cloneUnlessOtherwiseSpecified(target[key], optionsArgument);
			});
		}
		Object.keys(source).forEach(function (key) {
			if (!isMergeableObject(source[key]) || !target[key]) {
				destination[key] = cloneUnlessOtherwiseSpecified(source[key], optionsArgument);
			} else {
				destination[key] = deepMerge(target[key], source[key], optionsArgument);
			}
		});

		return destination;
	}
});