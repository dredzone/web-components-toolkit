/* @flow */

/**
 * A helper function for generating unique ids based on Data.now
 */
let prevTimeId: number = 0;
let prevUniqueId: number = 0;

export const uniqueId: Function = (): number => {
	let newUniqueId: number = Date.now();
	if (newUniqueId === prevTimeId) {
		++prevUniqueId;
	} else {
		prevTimeId = newUniqueId;
		prevUniqueId = 0;
	}
	return Number(`${String(newUniqueId)}${String(prevUniqueId)}`);
};
