/* @flow */
export default {

};

export type IsType = {[key: string]: (val: any) => boolean};

export type ApiIsType = IsType & {
	not: {[key: string]: (val: Function) => Function};
	all: {[key: string]: (val: Function) => Function};
	any: {[key: string]: (val: Function) => Function};
};

export type MixBuilderType = {
	with(...mixins: Array<Function>): Class<any>;
};

export type ConfigObjectType = {
	get(key: string): any;
	set(key: string, value: any): void;
};

export type PropertyDescriptorType = {
	configurable?: boolean;
	enumerable?: boolean;
	value?: any;
	writable?: boolean;
	get(): any;
	set(v: any): void;
};

export type AdviceType = {
	before(behaviour: Function, ...methodNames: string[]): Function,

	after(behaviour: Function, ...methodNames: string[]): Function,

	around(behaviour: Function, ...methodNames: string[]): Function,

	afterThrow(behaviour: Function, ...methodNames: string[]): Function
};
