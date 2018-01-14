import {expect} from 'chai';
import {isType} from '../lib/is-type.utility';
import {isNumber} from '../lib/is-number.utility';
import type {Is} from '../lib/is.helper';

function checkApi(is: Is, name: string, list: string[]) {
	list = list || ['all', 'any', 'not'];
	['all', 'any', 'not'].forEach((api: string) => {
		let exists = list.indexOf(api) !== -1;
		describe(`${api}.${name}`, () => {
			it('should ' + (exists ? '' : 'not ') + 'exist', () => {
				expect(is[api][name]).to[exists ? 'be': 'not'].exist;
			});
		});
	});
}

describe('isType checks', () => {
	describe('arguments', () => {
		it('should return true if passed parameter type is arguments', () => {
			let getArguments = () => arguments;
			let args = getArguments('test');
			expect(isType.arguments(args)).to.be.true;
		});
		it('should return false if passed parameter type is not arguments', () => {
			const notArgs = ['test'];
			expect(isType.arguments(notArgs)).to.be.false;
		});
	});

	checkApi(isType, 'arguments');

	describe('array', () => {
		it('should return true if passed parameter type is array', () => {
			let array = ['test'];
			expect(isType.array(array)).to.be.true;
		});
		it('should return false if passed parameter type is not array', () => {
			let notArray = 'test';
			expect(isType.array(notArray)).to.be.false;
		});
	});

	checkApi(isType, 'array');

	describe('boolean', () => {
		it('should return true if passed parameter type is boolean', () => {
			let bool = true;
			expect(isType.boolean(bool)).to.be.true;
		});
		it('should return false if passed parameter type is not boolean', () => {
			let notBool = 'test';
			expect(isType.boolean(notBool)).to.be.false;
		});
	});

	checkApi(isType, 'boolean');

	describe('error', () => {
		it('should return true if passed parameter type is error', () => {
			let error = new Error();
			expect(isType.error(error)).to.be.true;
		});
		it('should return false if passed parameter type is not error', () => {
			let notError = 'test';
			expect(isType.error(notError)).to.be.false;
		});
	});

	checkApi(isType, 'error');

	describe('function', () => {
		it('should return true if passed parameter type is function', () => {
			expect(isType.function(isType.function)).to.be.true;
		});
		it('should return false if passed parameter type is not function', () => {
			let notFunction = 'test';
			expect(isType.function(notFunction)).to.be.false;
		});
	});

	checkApi(isType, 'function');

	describe('null', () => {
		it('should return true if passed parameter type is null', () => {
			expect(isType.null(null)).to.be.true;
		});
		it('should return false if passed parameter type is not null', () => {
			let notNull = 'test';
			expect(isType.null(notNull)).to.be.false;
		});
	});

	checkApi(isType, 'null');

	describe('number', () => {
		it('should return true if passed parameter type is number', () => {
			expect(isType.number(1)).to.be.true;
		});
		it('should return false if passed parameter type is not number', () => {
			let notNumber = 'test';
			expect(isType.number(notNumber)).to.be.false;
		});
	});

	checkApi(isType, 'number');

	describe('object', () => {
		it('should return true if passed parameter type is object', () => {
			expect(isType.object({})).to.be.true;
		});
		it('should return false if passed parameter type is not object', () => {
			let notObject = 'test';
			expect(isType.object(notObject)).to.be.false;
		});
	});

	checkApi(isType, 'object');

	describe('regexp', () => {
		it('should return true if passed parameter type is regexp', () => {
			let regexp = new RegExp();
			expect(isType.regexp(regexp)).to.be.true;
		});
		it('should return false if passed parameter type is not regexp', () => {
			let notRegexp = 'test';
			expect(isType.regexp(notRegexp)).to.be.false;
		});
	});

	checkApi(isType, 'regexp');

	describe('string', () => {
		it('should return true if passed parameter type is string', () => {
			expect(isType.string('test')).to.be.true;
		});
		it('should return false if passed parameter type is not string', () => {
			expect(isType.string(1)).to.be.false;
		});
	});

	checkApi(isType, 'string');

	describe('undefined', () => {
		it('should return true if passed parameter type is undefined', () => {
			expect(isType.undefined(undefined)).to.be.true;
		});
		it('should return false if passed parameter type is not undefined', () => {
			expect(isType.undefined(null)).to.be.false;
			expect(isType.undefined('test')).to.be.false;
		});
	});

	checkApi(isType, 'undefined');
});

describe('isNumber checks', () => {
	describe('even', () => {
		it('should return true if given number is even', () => {
			expect(isNumber.even(2)).to.be.true;
		});
		it('should return false if given number is not even', () => {
			expect(isNumber.even(3)).to.be.false;
		});
		it('should return false if given number is not integer', () => {
			expect(isNumber.even(2.5)).to.be.false;
		});
	});

	checkApi(isNumber,'even');

	describe('odd', () => {
		it('should return true if given number is odd', () => {
			expect(isNumber.odd(3)).to.be.true;
		});
		it('should return true if given number is negative odd', () => {
			expect(isNumber.odd(-3)).to.be.true;
		});
		it('should return false if given number is not odd', () => {
			expect(isNumber.odd(2)).to.be.false;
		});
		it('should return false if given number is not integer', () => {
			expect(isNumber.odd(2.5)).to.be.false;
		});
	});

	checkApi(isNumber, 'odd');

	describe('positive', () => {
		it('should return true if given number is positive', () => {
			expect(isNumber.positive(3)).to.be.true;
		});
		it('should return false if given number is not positive', () => {
			expect(isNumber.positive(-2)).to.be.false;
		});
	});

	checkApi(isNumber, 'positive');

	describe('negative', () => {
		it('should return true if given number is negative', () => {
			expect(isNumber.negative(-3)).to.be.true;
		});
		it('should return false if given number is not negative', () => {
			expect(isNumber.negative(2)).to.be.false;
		});
	});

	checkApi(isNumber, 'negative');

	describe('above', () => {
		it('should return true if given number is above minimum value', () => {
			expect(isNumber.above(13, 12)).to.be.true;
		});
		it('should return false if given number is not above minimum value', () => {
			expect(isNumber.above(12, 13)).to.be.false;
		});
	});

	checkApi(isNumber, 'above', ['not']);

	describe('under', () => {
		it('should return true if given number is under maximum value', () => {
			expect(isNumber.under(11, 12)).to.be.true;
		});
		it('should return false if given number is not under maximum value', () => {
			expect(isNumber.under(12, 11)).to.be.false;
		});
	});

	checkApi(isNumber, 'under', ['not']);

	describe('within', () => {
		it('should return true if given number is within minimum and maximum values', () => {
			expect(isNumber.within(10, 5, 15)).to.be.true;
		});
		it('should return false if given number is not within minimum and maximum values', () => {
			expect(isNumber.within(20, 5, 15)).to.be.false;
		});
	});

	checkApi(isNumber, 'within', ['not']);

	describe('decimal', () =>  {
		it('should return true if given number is decimal', () => {
			expect(isNumber.decimal(4.2)).to.be.true;
		});
		it('should return false if given number is not decimal', () => {
			expect(isNumber.decimal(2)).to.be.false;
		});
	});

	checkApi(isNumber, 'decimal');

	describe('integer', function() {
		it('should return true if given number is integer', () => {
			expect(isNumber.integer(4)).to.be.true;
		});
		it('should return false if given number is not integer', () => {
			expect(isNumber.integer(2.2)).to.be.false;
		});
	});
	checkApi(isNumber, 'integer');

	describe('finite', () => {
		it('should return true if given number is finite', () => {
			expect(isNumber.finite(4)).to.be.true;
		});
		it('should return false if given number is not finite', () => {
			expect(isNumber.finite(Infinity)).to.be.false;
		});
	});

	checkApi(isNumber, 'finite');

	describe('infinite', () => {
		it('should return true if given number is infinite', () => {
			expect(isNumber.infinite(Infinity)).to.be.true;
		});
		it('should return false if given number is not infinite', () => {
			expect(isNumber.infinite(1)).to.be.false;
			expect(isNumber.infinite(NaN)).to.be.false;
		});
	});

	checkApi(isNumber, 'infinite');
});
