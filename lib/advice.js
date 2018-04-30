/*  */
import before from './advice/before';
import around from './advice/around';
import after from './advice/after';
import afterThrow from './advice/after-throw';


const advice = Object.freeze({
	before,
	around,
	after,
	afterThrow
});

export default advice;
