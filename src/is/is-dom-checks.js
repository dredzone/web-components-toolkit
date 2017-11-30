import {setApi} from './is-helpers';
import {isTypeChecks} from './is-type-checks';

export const isDomChecks = (function () {
	const is = {
		not: {},
		any: {}
	};

	is.domElement = obj => {
		if ('HTMLElement' in window) {
			return obj instanceof HTMLElement;
		}
		return Boolean(obj && isTypeChecks.object(obj) && obj.nodeType === 1 && obj.nodeName);
	};

	is.domElementTypeOf = (obj, type) => is.domElement(obj) && obj.nodeName.toLowerCase() === type.toLowerCase();

	return setApi(is);
})();

