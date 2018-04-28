/* @flow */
import before from './advice/before';
import around from './advice/around';
import after from './advice/after';
import afterThrow from './advice/after-throw';
import type {Advice} from './types';

const advice: Advice = Object.freeze({
	before,
	around,
	after,
	afterThrow
});

export default advice;
