/*  */

/**
 * A helper function for generating unique ids based on Data.now
 */
let prevTimeId = 0;
let prevUniqueId = 0;

export const uniqueId = () => {
	let newUniqueId = Date.now();
	if (newUniqueId === prevTimeId) {
		++prevUniqueId;
	} else {
		prevTimeId = newUniqueId;
		prevUniqueId = 0;
	}
	return Number(`${String(newUniqueId)}${String(prevUniqueId)}`);
};
