import {expect} from 'chai';
import {is} from '../src/is';

function checkApi(name: string, list: string[]) {
	let parts = name.split('.');
	let ns = parts.length === 2 ? `${parts[0]}.` : '';
	let slicedIs = parts.length === 2 ? is[parts[0]] : is;
	name = parts.length === 2 ? parts[1] : parts[0];

	list = list || ['all', 'any', 'not'];
	['all', 'any', 'not'].forEach((api: string) => {
		let exists = list.indexOf(api) !== -1;
		describe(`is.${ns}${api}.${name}`, () => {
			it('should ' + (exists ? '' : 'not ') + 'exist', () => {
				expect(slicedIs[api][name]).to[exists ? 'be': 'not'].exist;
			});
		});
	});
}

describe('type checks', () => {
	describe('is.type.arguments', () => {
		it('should return true if passed parameter type is arguments', () => {
			let getArguments = () => arguments;
			let args = getArguments('test');
			expect(is.type.arguments(args)).to.be.true;
		});
		it('should return false if passed parameter type is not arguments', () => {
			const notArgs = ['test'];
			expect(is.type.arguments(notArgs)).to.be.false;
		});
	});
	checkApi('type.arguments');

	describe('is.type.array', () => {
		it('should return true if passed parameter type is array', () => {
			let array = ['test'];
			expect(is.type.array(array)).to.be.true;
		});
		it('should return false if passed parameter type is not array', () => {
			let notArray = 'test';
			expect(is.type.array(notArray)).to.be.false;
		});
	});

	checkApi('type.array');

	describe('is.type.boolean', () => {
		it('should return true if passed parameter type is boolean', () => {
			let bool = true;
			expect(is.type.boolean(bool)).to.be.true;
		});
		it('should return false if passed parameter type is not boolean', () => {
			let notBool = 'test';
			expect(is.type.boolean(notBool)).to.be.false;
		});
	});

	checkApi('type.boolean');

	describe('is.type.error', () => {
		it('should return true if passed parameter type is error', () => {
			let error = new Error();
			expect(is.type.error(error)).to.be.true;
		});
		it('should return false if passed parameter type is not error', () => {
			let notError = 'test';
			expect(is.type.error(notError)).to.be.false;
		});
	});

	checkApi('type.error');

	describe('is.type.function', () => {
		it('should return true if passed parameter type is function', () => {
			expect(is.type.function(is.type.function)).to.be.true;
		});
		it('should return false if passed parameter type is not function', () => {
			let notFunction = 'test';
			expect(is.type.function(notFunction)).to.be.false;
		});
	});

	checkApi('type.function');

	describe('is.type.null', () => {
		it('should return true if passed parameter type is null', () => {
			expect(is.type.null(null)).to.be.true;
		});
		it('should return false if passed parameter type is not null', () => {
			let notNull = 'test';
			expect(is.type.null(notNull)).to.be.false;
		});
	});

	checkApi('type.null');

	describe('is.type.number', () => {
		it('should return true if passed parameter type is number', () => {
			expect(is.type.number(1)).to.be.true;
		});
		it('should return false if passed parameter type is not number', () => {
			let notNumber = 'test';
			expect(is.type.number(notNumber)).to.be.false;
		});
	});

	checkApi('type.number');

	describe('is.type.object', () => {
		it('should return true if passed parameter type is object', () => {
			expect(is.type.object({})).to.be.true;
		});
		it('should return false if passed parameter type is not object', () => {
			let notObject = 'test';
			expect(is.type.object(notObject)).to.be.false;
		});
	});

	checkApi('type.object');

	describe('is.type.regexp', () => {
		it('should return true if passed parameter type is regexp', () => {
			let regexp = new RegExp();
			expect(is.type.regexp(regexp)).to.be.true;
		});
		it('should return false if passed parameter type is not regexp', () => {
			let notRegexp = 'test';
			expect(is.type.regexp(notRegexp)).to.be.false;
		});
	});

	checkApi('type.regexp');

	describe('is.type.string', () => {
		it('should return true if passed parameter type is string', () => {
			expect(is.type.string('test')).to.be.true;
		});
		it('should return false if passed parameter type is not string', () => {
			expect(is.type.string(1)).to.be.false;
		});
	});

	checkApi('type.string');

	describe('is.type.undefined', () => {
		it('should return true if passed parameter type is undefined', () => {
			expect(is.type.undefined(undefined)).to.be.true;
		});
		it('should return false if passed parameter type is not undefined', () => {
			expect(is.type.undefined(null)).to.be.false;
			expect(is.type.undefined('test')).to.be.false;
		});
	});

	checkApi('type.undefined');
});

describe('arithmetic checks', () => {
	describe('is.number.even', () => {
		it('should return true if given number is even', () => {
			expect(is.number.even(2)).to.be.true;
		});
		it('should return false if given number is not even', () => {
			expect(is.number.even(3)).to.be.false;
		});
		it('should return false if given number is not integer', () => {
			expect(is.number.even(2.5)).to.be.false;
		});
	});
	checkApi('number.even');

	describe('is.number.odd', () => {
		it('should return true if given number is odd', () => {
			expect(is.number.odd(3)).to.be.true;
		});
		it('should return true if given number is negative odd', () => {
			expect(is.number.odd(-3)).to.be.true;
		});
		it('should return false if given number is not odd', () => {
			expect(is.number.odd(2)).to.be.false;
		});
		it('should return false if given number is not integer', () => {
			expect(is.number.odd(2.5)).to.be.false;
		});
	});
	checkApi('number.odd');

	describe('is.number.positive', () => {
		it('should return true if given number is positive', () => {
			expect(is.number.positive(3)).to.be.true;
		});
		it('should return false if given number is not positive', () => {
			expect(is.number.positive(-2)).to.be.false;
		});
	});
	checkApi('number.positive');

	describe('is.number.negative', () => {
		it('should return true if given number is negative', () => {
			expect(is.number.negative(-3)).to.be.true;
		});
		it('should return false if given number is not negative', () => {
			expect(is.number.negative(2)).to.be.false;
		});
	});
	checkApi('number.negative');

	describe('is.number.above', () => {
		it('should return true if given number is above minimum value', () => {
			expect(is.number.above(13, 12)).to.be.true;
		});
		it('should return false if given number is not above minimum value', () => {
			expect(is.number.above(12, 13)).to.be.false;
		});
	});
	checkApi('number.above', ['not']);

	describe('is.number.under', () => {
		it('should return true if given number is under maximum value', () => {
			expect(is.number.under(11, 12)).to.be.true;
		});
		it('should return false if given number is not under maximum value', () => {
			expect(is.number.under(12, 11)).to.be.false;
		});
	});
	checkApi('number.under', ['not']);

	describe('is.number.within', () => {
		it('should return true if given number is within minimum and maximum values', () => {
			expect(is.number.within(10, 5, 15)).to.be.true;
		});
		it('should return false if given number is not within minimum and maximum values', () => {
			expect(is.number.within(20, 5, 15)).to.be.false;
		});
	});
	checkApi('number.within', ['not']);

	describe('is.number.decimal', () =>  {
		it('should return true if given number is decimal', () => {
			expect(is.number.decimal(4.2)).to.be.true;
		});
		it('should return false if given number is not decimal', () => {
			expect(is.number.decimal(2)).to.be.false;
		});
	});
	checkApi('number.decimal');

	describe('is.number.integer', function() {
		it('should return true if given number is integer', () => {
			expect(is.number.integer(4)).to.be.true;
		});
		it('should return false if given number is not integer', () => {
			expect(is.number.integer(2.2)).to.be.false;
		});
	});
	checkApi('number.integer');

	describe('is.number.finite', () => {
		it('should return true if given number is finite', () => {
			expect(is.number.finite(4)).to.be.true;
		});
		it('should return false if given number is not finite', () => {
			expect(is.number.finite(Infinity)).to.be.false;
		});
	});
	checkApi('number.finite');

	describe('is.number.infinite', () => {
		it('should return true if given number is infinite', () => {
			expect(is.number.infinite(Infinity)).to.be.true;
		});
		it('should return false if given number is not infinite', () => {
			expect(is.number.infinite(1)).to.be.false;
			expect(is.number.infinite(NaN)).to.be.false;
		});
	});
	checkApi('number.infinite');
});
