export type Checker = {[key: string]: (val: any) => boolean};

export type ApiChecker = Checker & {
	not: {[key: string]: (val: Function) => Function},
	all: {[key: string]: (val: Function) => Function},
	any: {[key: string]: (val: Function) => Function}
};

export type MixBuilder = {
	with(...mixins: Array<Function>): Class<any>;
};
