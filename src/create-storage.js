/* @flow */
export default (creator: Function = Object.create.bind(null, null, {})): Function => {
	let store: WeakMap<any, any> = new WeakMap();
	return (obj: any): any => {
		let value: any = store.get(obj);
		if (!value) {
			store.set(obj, value = creator(obj));
		}
		return value;
	};
};
