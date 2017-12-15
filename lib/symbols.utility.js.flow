/* @flow */
import {uniqueId} from './unique-id.utility';

/**
 * A helper function for simulating instances of the `Symbol`
 */

let domain: string = 'abcdefghijklmnopqrstuvwxyz';
let idLength: number = 8;

export const symbols = Object.freeze({
	setDomain(newDomain: string) {
		domain = newDomain;
	},
	setLength(newLength: number) {
		idLength = newLength;
	},
	get: (description: string): string => {
		if (!description) {
			let builder: string[] = [];
			let len = domain.length;
			while (builder.length < idLength) {
				builder.push(domain.charAt(Math.floor(Math.random() * len)));
			}
			description = builder.join('');
		}

		return `${description}_${uniqueId()}`;
	}
});
