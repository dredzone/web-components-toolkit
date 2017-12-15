export type Is = {[key: string]: (val: any) => boolean};

export type ApiIs = Is & {
	not: {[key: string]: (val: Function) => Function};
	all: {[key: string]: (val: Function) => Function};
	any: {[key: string]: (val: Function) => Function};
};

export type MixBuilder = {
	with(...mixins: Array<Function>): Class<any>;
};

export type ConfigObject = {
	get(key: string): any;
	set(key: string, value: any): void;
};
