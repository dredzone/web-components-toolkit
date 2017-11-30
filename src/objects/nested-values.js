export const getPropertyValue = (obj: Object, key: string, defaultValue: Object = null): Object => {
	if (key.indexOf('.') === -1) {
		return obj[key] ? obj[key] : defaultValue;
	}
	const parts: string[] = key.split('.');
	const length: number = parts.length;
	let object: Object = obj;

	for (let i = 0; i < length; i++) {
		object = object[parts[i]];
		if (object === undefined) {
			object = defaultValue;
			return;
		}
	}
	return object;
};

export const setPropertyValue = (obj: Object, key: string, val: any): void => {
	if (key.indexOf('.') === -1) {
		obj[key] = val;
	}
	const parts = key.split('.');
	const length = parts.length;
	let object = obj;

	for (let i = 0; i < length - 1; i++) {
		if (!object[parts[i]]) {
			object[parts[i]] = {};
		}
		object = object[parts[i]];
	}
	object[parts[length - 1]] = val;
};
