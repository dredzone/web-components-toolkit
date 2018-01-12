/* @flow */
export const functionName = (fn: Function): string => {
	let name: string = '';
	let matches: any = fn.toString().match(/^\s*function\s*(\S*)\s*\(/);
	if (Array.isArray(matches) && matches.length > 0) {
		name = matches[1];
	}
	return name;
};
