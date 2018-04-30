/* @flow */
import before from './advice/before';
import around from './advice/around';
import after from './advice/after';
import afterThrow from './advice/after-throw';

export type Advice = {
	before(behaviour: Function, ...methodNames: string[]): Function;

	around(behaviour: Function, ...methodNames: string[]): Function;

	after(behaviour: Function, ...methodNames: string[]): Function;

	afterThrow(behaviour: Function, ...methodNames: string[]): Function;
};

const advice: Advice = Object.freeze({
	before,
	around,
	after,
	afterThrow
});

export default advice;
