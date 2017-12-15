/*  */
import {uniqueId} from './unique-id.utility';

/**
 * A helper function for simulating instances of the `Symbol`
 */

let domain = 'abcdefghijklmnopqrstuvwxyz';
let idLength = 8;

export const symbols = Object.freeze({
	setDomain(newDomain) {
		domain = newDomain;
	},
	setLength(newLength) {
		idLength = newLength;
	},
	get: (description) => {
		if (!description) {
			let builder = [];
			let len = domain.length;
			while (builder.length < idLength) {
				builder.push(domain.charAt(Math.floor(Math.random() * len)));
			}
			description = builder.join('');
		}

		return `${description}_${uniqueId()}`;
	}
});
