import {expect} from 'chai';
import {typeChecks} from '../lib/type.checks';
import {numberChecks} from '../lib/number.checks';

function checkApi(checker: Object, name: string, list: string[]) {
	list = list || ['all', 'any', 'not'];
	['all', 'any', 'not'].forEach((api: string) => {
		let exists = list.indexOf(api) !== -1;
		describe(`${api}.${name}`, () => {
			it('should ' + (exists ? '' : 'not ') + 'exist', () => {
				expect(checker[api][name]).to[exists ? 'be': 'not'].exist;
			});
		});
	});
}

describe('type checks', () => {
	describe('arguments', () => {
		it('should return true if passed parameter type is arguments', () => {
			let getArguments = () => arguments;
			let args = getArguments('test');
			expect(typeChecks.arguments(args)).to.be.true;
		});
		it('should return false if passed parameter type is not arguments', () => {
			const notArgs = ['test'];
			expect(typeChecks.arguments(notArgs)).to.be.false;
		});
	});

	checkApi(typeChecks, 'arguments');

	describe('array', () => {
		it('should return true if passed parameter type is array', () => {
			let array = ['test'];
			expect(typeChecks.array(array)).to.be.true;
		});
		it('should return false if passed parameter type is not array', () => {
			let notArray = 'test';
			expect(typeChecks.array(notArray)).to.be.false;
		});
	});

	checkApi(typeChecks, 'array');

	describe('boolean', () => {
		it('should return true if passed parameter type is boolean', () => {
			let bool = true;
			expect(typeChecks.boolean(bool)).to.be.true;
		});
		it('should return false if passed parameter type is not boolean', () => {
			let notBool = 'test';
			expect(typeChecks.boolean(notBool)).to.be.false;
		});
	});

	checkApi(typeChecks, 'boolean');

	describe('error', () => {
		it('should return true if passed parameter type is error', () => {
			let error = new Error();
			expect(typeChecks.error(error)).to.be.true;
		});
		it('should return false if passed parameter type is not error', () => {
			let notError = 'test';
			expect(typeChecks.error(notError)).to.be.false;
		});
	});

	checkApi(typeChecks, 'error');

	describe('function', () => {
		it('should return true if passed parameter type is function', () => {
			expect(typeChecks.function(typeChecks.function)).to.be.true;
		});
		it('should return false if passed parameter type is not function', () => {
			let notFunction = 'test';
			expect(typeChecks.function(notFunction)).to.be.false;
		});
	});

	checkApi(typeChecks, 'function');

	describe('null', () => {
		it('should return true if passed parameter type is null', () => {
			expect(typeChecks.null(null)).to.be.true;
		});
		it('should return false if passed parameter type is not null', () => {
			let notNull = 'test';
			expect(typeChecks.null(notNull)).to.be.false;
		});
	});

	checkApi(typeChecks, 'null');

	describe('number', () => {
		it('should return true if passed parameter type is number', () => {
			expect(typeChecks.number(1)).to.be.true;
		});
		it('should return false if passed parameter type is not number', () => {
			let notNumber = 'test';
			expect(typeChecks.number(notNumber)).to.be.false;
		});
	});

	checkApi(typeChecks, 'number');

	describe('object', () => {
		it('should return true if passed parameter type is object', () => {
			expect(typeChecks.object({})).to.be.true;
		});
		it('should return false if passed parameter type is not object', () => {
			let notObject = 'test';
			expect(typeChecks.object(notObject)).to.be.false;
		});
	});

	checkApi(typeChecks, 'object');

	describe('regexp', () => {
		it('should return true if passed parameter type is regexp', () => {
			let regexp = new RegExp();
			expect(typeChecks.regexp(regexp)).to.be.true;
		});
		it('should return false if passed parameter type is not regexp', () => {
			let notRegexp = 'test';
			expect(typeChecks.regexp(notRegexp)).to.be.false;
		});
	});

	checkApi(typeChecks, 'regexp');

	describe('string', () => {
		it('should return true if passed parameter type is string', () => {
			expect(typeChecks.string('test')).to.be.true;
		});
		it('should return false if passed parameter type is not string', () => {
			expect(typeChecks.string(1)).to.be.false;
		});
	});

	checkApi(typeChecks, 'string');

	describe('undefined', () => {
		it('should return true if passed parameter type is undefined', () => {
			expect(typeChecks.undefined(undefined)).to.be.true;
		});
		it('should return false if passed parameter type is not undefined', () => {
			expect(typeChecks.undefined(null)).to.be.false;
			expect(typeChecks.undefined('test')).to.be.false;
		});
	});

	checkApi(typeChecks, 'undefined');
});

describe('number checks', () => {
	describe('even', () => {
		it('should return true if given number is even', () => {
			expect(numberChecks.even(2)).to.be.true;
		});
		it('should return false if given number is not even', () => {
			expect(numberChecks.even(3)).to.be.false;
		});
		it('should return false if given number is not integer', () => {
			expect(numberChecks.even(2.5)).to.be.false;
		});
	});

	checkApi(numberChecks,'even');

	describe('odd', () => {
		it('should return true if given number is odd', () => {
			expect(numberChecks.odd(3)).to.be.true;
		});
		it('should return true if given number is negative odd', () => {
			expect(numberChecks.odd(-3)).to.be.true;
		});
		it('should return false if given number is not odd', () => {
			expect(numberChecks.odd(2)).to.be.false;
		});
		it('should return false if given number is not integer', () => {
			expect(numberChecks.odd(2.5)).to.be.false;
		});
	});

	checkApi(numberChecks, 'odd');

	describe('positive', () => {
		it('should return true if given number is positive', () => {
			expect(numberChecks.positive(3)).to.be.true;
		});
		it('should return false if given number is not positive', () => {
			expect(numberChecks.positive(-2)).to.be.false;
		});
	});

	checkApi(numberChecks, 'positive');

	describe('negative', () => {
		it('should return true if given number is negative', () => {
			expect(numberChecks.negative(-3)).to.be.true;
		});
		it('should return false if given number is not negative', () => {
			expect(numberChecks.negative(2)).to.be.false;
		});
	});

	checkApi(numberChecks, 'negative');

	describe('above', () => {
		it('should return true if given number is above minimum value', () => {
			expect(numberChecks.above(13, 12)).to.be.true;
		});
		it('should return false if given number is not above minimum value', () => {
			expect(numberChecks.above(12, 13)).to.be.false;
		});
	});

	checkApi(numberChecks, 'above', ['not']);

	describe('under', () => {
		it('should return true if given number is under maximum value', () => {
			expect(numberChecks.under(11, 12)).to.be.true;
		});
		it('should return false if given number is not under maximum value', () => {
			expect(numberChecks.under(12, 11)).to.be.false;
		});
	});

	checkApi(numberChecks, 'under', ['not']);

	describe('within', () => {
		it('should return true if given number is within minimum and maximum values', () => {
			expect(numberChecks.within(10, 5, 15)).to.be.true;
		});
		it('should return false if given number is not within minimum and maximum values', () => {
			expect(numberChecks.within(20, 5, 15)).to.be.false;
		});
	});

	checkApi(numberChecks, 'within', ['not']);

	describe('decimal', () =>  {
		it('should return true if given number is decimal', () => {
			expect(numberChecks.decimal(4.2)).to.be.true;
		});
		it('should return false if given number is not decimal', () => {
			expect(numberChecks.decimal(2)).to.be.false;
		});
	});

	checkApi(numberChecks, 'decimal');

	describe('integer', function() {
		it('should return true if given number is integer', () => {
			expect(numberChecks.integer(4)).to.be.true;
		});
		it('should return false if given number is not integer', () => {
			expect(numberChecks.integer(2.2)).to.be.false;
		});
	});
	checkApi(numberChecks, 'integer');

	describe('finite', () => {
		it('should return true if given number is finite', () => {
			expect(numberChecks.finite(4)).to.be.true;
		});
		it('should return false if given number is not finite', () => {
			expect(numberChecks.finite(Infinity)).to.be.false;
		});
	});

	checkApi(numberChecks, 'finite');

	describe('infinite', () => {
		it('should return true if given number is infinite', () => {
			expect(numberChecks.infinite(Infinity)).to.be.true;
		});
		it('should return false if given number is not infinite', () => {
			expect(numberChecks.infinite(1)).to.be.false;
			expect(numberChecks.infinite(NaN)).to.be.false;
		});
	});

	checkApi(numberChecks, 'infinite');
});
