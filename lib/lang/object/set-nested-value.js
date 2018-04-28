/*  */
export default (obj, key, value) => {
	if (key.indexOf('.') === -1) {
		obj[key] = value;
	} else {
		const parts = key.split('.');
		const length = parts.length;
		let object = obj;

		for (let i = 0; i < length - 1; i++) {
			if (typeof object[parts[i]] === 'undefined') {
				object[parts[i]] = {};
			}
			object = object[parts[i]];
		}
		object[parts[length - 1]] = value;
	}
};
