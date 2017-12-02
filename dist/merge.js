define(['exports'], function (exports) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
		return typeof obj;
	} : function (obj) {
		return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};

	var merge = exports.merge = function merge(target, source, optionsArgument) {
		var sourceIsArray = Array.isArray(source);
		var targetIsArray = Array.isArray(target);
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

	merge.all = function (array, optionsArgument) {
		if (!Array.isArray(array)) {
			throw new Error('first argument should be an array');
		}

		return array.reduce(function (prev, next) {
			return merge(prev, next, optionsArgument);
		}, {});
	};

	function isMergeableObject(value) {
		return isNonNullObject(value) && !isSpecial(value);
	}

	function isNonNullObject(value) {
		return value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
	}

	function isSpecial(value) {
		var stringValue = Object.prototype.toString.call(value);
		return stringValue === '[object RegExp]' || stringValue === '[object Date]';
	}

	function emptyTarget(val) {
		return Array.isArray(val) ? [] : {};
	}

	function cloneUnlessOtherwiseSpecified(value, optionsArgument) {
		var clone = !optionsArgument || optionsArgument.clone !== false;
		return clone && isMergeableObject(value) ? merge(emptyTarget(value), value, optionsArgument) : value;
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
				destination[key] = merge(target[key], source[key], optionsArgument);
			}
		});

		return destination;
	}
});