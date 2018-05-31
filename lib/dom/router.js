/*  */
import is from '../type.js';
import { default as listenEvent} from '../dom-events/listen-event.js';
import removeElement from './remove-element.js';


export default (domEntryPoint) => {
	let routes = {};
	let loadEventHandler = null;
	let hashEventHandler = null;
	const lastDomEntryPoint = domEntryPoint.cloneNode(true);
	let lastRouteHandler = null;

	const navigateTo = (hashUrl) => {
		window.location.hash = hashUrl;
	};

	const otherwise = (routeHandler) => {
		routes['*'] = routeHandler;
	};

	const addRoute = (hashUrl, routeHandler, data) => {
		routes[hashUrl] = routeHandler;
		routes[hashUrl].data = data;
		return {addRoute, otherwise, navigateTo};
	};

	const initializeDomElement = () => {
		if (!domEntryPoint.parentElement) {
			return;
		}

		const domClone = lastDomEntryPoint.cloneNode(true);
		if (domEntryPoint && domEntryPoint.parentElement) {
			domEntryPoint.parentElement.insertBefore(domClone, domEntryPoint);
		}

		removeElement(domEntryPoint);
		domEntryPoint = domClone;
	};

	const disposeLastRoute = () => {
		if (lastRouteHandler && !is.undefined(lastRouteHandler.dispose)) {
			lastRouteHandler.dispose(domEntryPoint);
		}
	};

	const handleRouting = () => {
		const defaultRouteIdentifier = '*';
		const currentHash = location.hash.slice(1);

		const maybeMatchingRouteIdentifier = findMatchingRouteIdentifier(currentHash, Object.keys(routes));
		let routeParams = {};
		if (maybeMatchingRouteIdentifier) {
			routeParams = extractRouteParams(maybeMatchingRouteIdentifier, currentHash);
		}

		const routeHandler = Object
			.keys(routes)
			.indexOf(maybeMatchingRouteIdentifier) > -1 ? routes[maybeMatchingRouteIdentifier] : routes[defaultRouteIdentifier];

		if (routeHandler) {
			disposeLastRoute();
			lastRouteHandler = routeHandler;
			initializeDomElement();
			routeHandler(domEntryPoint, routeParams, routeHandler.data);
		}
	};

	if (hashEventHandler) {
		hashEventHandler.remove();
	}
	if (loadEventHandler) {
		loadEventHandler.remove();
	}
	hashEventHandler = listenEvent(window, 'hashchange', handleRouting);
	loadEventHandler = listenEvent(window, 'load', handleRouting);

	return {addRoute, otherwise, navigateTo};
};

export const parseRouteParamToCorrectType = (paramValue) => {
	if (!isNaN(paramValue)) {
		return parseInt(paramValue, 10);
	}

	if (paramValue === 'true' || paramValue === 'false') {
		return JSON.parse(paramValue);
	}

	return paramValue;
};

function extractRouteParams(routeIdentifier, currentHash) {
	const splittedHash = currentHash.split('/');
	const splittedRouteIdentifier = routeIdentifier.split('/');

	return splittedRouteIdentifier.map((routeIdentifierToken, index) => {
		if (routeIdentifierToken.indexOf(':', 0) === -1) {
			return null;
		}
		const routeParam = {};
		const key = routeIdentifierToken.substr(1, routeIdentifierToken.length - 1);
		routeParam[key] = splittedHash[index];
		return routeParam;
	})
		.filter(p => p !== null)
		.reduce((acc, curr) => {
			if (curr) {
				Object.keys(curr).forEach(key => {
						// $FlowFixMe
						acc[key] = parseRouteParamToCorrectType(curr[key]);
				});
			}
			return acc;
		}, {});
}

function findMatchingRouteIdentifier(currentHash, routeKeys) {
	const splittedHash = currentHash.split('/');
	const firstHashToken = splittedHash[0];

	return routeKeys
		.filter(routeKey => {
			const splittedRouteKey = routeKey.split('/');
			const staticRouteTokensAreEqual = splittedRouteKey
				.map((routeToken, i) => {
					if (routeToken.indexOf(':', 0) !== -1) {
						return true;
					}
					return routeToken === splittedHash[i];
				})
				.reduce((countInvalid, currentValidationState) => {
					if (currentValidationState === false) {
						++countInvalid;
					}
					return countInvalid;
				}, 0) === 0;

			return routeKey.indexOf(firstHashToken, 0) !== -1 &&
				staticRouteTokensAreEqual &&
				splittedHash.length === splittedRouteKey.length;
		})[0];
}
