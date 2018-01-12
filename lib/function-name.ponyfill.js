/*  */
export const functionName = (fn) => {
	let name = '';
	let matches = fn.toString().match(/^\s*function\s*(\S*)\s*\(/);
	if (Array.isArray(matches) && matches.length > 0) {
		name = matches[1];
	}
	return name;
};
