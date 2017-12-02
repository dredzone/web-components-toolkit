import {expect} from 'chai';
import {checks} from '../src/checks';

function checkApi(name: string, list: string[]) {
	let parts = name.split('.');
	let ns = parts.length === 2 ? `${parts[0]}.` : '';
	let slicedChecks = parts.length === 2 ? checks[parts[0]] : checks;
	name = parts.length === 2 ? parts[1] : parts[0];

	list = list || ['all', 'any', 'not'];
	['all', 'any', 'not'].forEach((api: string) => {
		let exists = list.indexOf(api) !== -1;
		describe(`checks.${ns}${api}.${name}`, () => {
			it('should ' + (exists ? '' : 'not ') + 'exist', () => {
				expect(slicedChecks[api][name]).to[exists ? 'be': 'not'].exist;
			});
		});
	});
}

describe('type checks', () => {
	describe('checks.type.arguments', () => {
		it('should return true if passed parameter type is arguments', () => {
			let getArguments = () => arguments;
			let args = getArguments('test');
			expect(checks.type.arguments(args)).to.be.true;
		});
		it('should return false if passed parameter type is not arguments', () => {
			const notArgs = ['test'];
			expect(checks.type.arguments(notArgs)).to.be.false;
		});
	});
	checkApi('type.arguments');

	describe('checks.type.array', () => {
		it('should return true if passed parameter type is array', () => {
			let array = ['test'];
			expect(checks.type.array(array)).to.be.true;
		});
		it('should return false if passed parameter type is not array', () => {
			let notArray = 'test';
			expect(checks.type.array(notArray)).to.be.false;
		});
	});

	checkApi('type.array');

	describe('checks.type.boolean', () => {
		it('should return true if passed parameter type is boolean', () => {
			let bool = true;
			expect(checks.type.boolean(bool)).to.be.true;
		});
		it('should return false if passed parameter type is not boolean', () => {
			let notBool = 'test';
			expect(checks.type.boolean(notBool)).to.be.false;
		});
	});

	checkApi('type.boolean');

	describe('checks.type.error', () => {
		it('should return true if passed parameter type is error', () => {
			let error = new Error();
			expect(checks.type.error(error)).to.be.true;
		});
		it('should return false if passed parameter type is not error', () => {
			let notError = 'test';
			expect(checks.type.error(notError)).to.be.false;
		});
	});

	checkApi('type.error');

	describe('checks.type.function', () => {
		it('should return true if passed parameter type is function', () => {
			expect(checks.type.function(checks.type.function)).to.be.true;
		});
		it('should return false if passed parameter type is not function', () => {
			let notFunction = 'test';
			expect(checks.type.function(notFunction)).to.be.false;
		});
	});

	checkApi('type.function');

	describe('checks.type.null', () => {
		it('should return true if passed parameter type is null', () => {
			expect(checks.type.null(null)).to.be.true;
		});
		it('should return false if passed parameter type is not null', () => {
			let notNull = 'test';
			expect(checks.type.null(notNull)).to.be.false;
		});
	});

	checkApi('type.null');

	describe('checks.type.number', () => {
		it('should return true if passed parameter type is number', () => {
			expect(checks.type.number(1)).to.be.true;
		});
		it('should return false if passed parameter type is not number', () => {
			let notNumber = 'test';
			expect(checks.type.number(notNumber)).to.be.false;
		});
	});

	checkApi('type.number');

	describe('checks.type.object', () => {
		it('should return true if passed parameter type is object', () => {
			expect(checks.type.object({})).to.be.true;
		});
		it('should return false if passed parameter type is not object', () => {
			let notObject = 'test';
			expect(checks.type.object(notObject)).to.be.false;
		});
	});

	checkApi('type.object');

	describe('checks.type.regexp', () => {
		it('should return true if passed parameter type is regexp', () => {
			let regexp = new RegExp();
			expect(checks.type.regexp(regexp)).to.be.true;
		});
		it('should return false if passed parameter type is not regexp', () => {
			let notRegexp = 'test';
			expect(checks.type.regexp(notRegexp)).to.be.false;
		});
	});

	checkApi('type.regexp');

	describe('checks.type.string', () => {
		it('should return true if passed parameter type is string', () => {
			expect(checks.type.string('test')).to.be.true;
		});
		it('should return false if passed parameter type is not string', () => {
			expect(checks.type.string(1)).to.be.false;
		});
	});

	checkApi('type.string');

	describe('checks.type.undefined', () => {
		it('should return true if passed parameter type is undefined', () => {
			expect(checks.type.undefined(undefined)).to.be.true;
		});
		it('should return false if passed parameter type is not undefined', () => {
			expect(checks.type.undefined(null)).to.be.false;
			expect(checks.type.undefined('test')).to.be.false;
		});
	});

	checkApi('type.undefined');
});

describe('number checks', () => {
	describe('checks.number.even', () => {
		it('should return true if given number is even', () => {
			expect(checks.number.even(2)).to.be.true;
		});
		it('should return false if given number is not even', () => {
			expect(checks.number.even(3)).to.be.false;
		});
		it('should return false if given number is not integer', () => {
			expect(checks.number.even(2.5)).to.be.false;
		});
	});
	checkApi('number.even');

	describe('checks.number.odd', () => {
		it('should return true if given number is odd', () => {
			expect(checks.number.odd(3)).to.be.true;
		});
		it('should return true if given number is negative odd', () => {
			expect(checks.number.odd(-3)).to.be.true;
		});
		it('should return false if given number is not odd', () => {
			expect(checks.number.odd(2)).to.be.false;
		});
		it('should return false if given number is not integer', () => {
			expect(checks.number.odd(2.5)).to.be.false;
		});
	});
	checkApi('number.odd');

	describe('checks.number.positive', () => {
		it('should return true if given number is positive', () => {
			expect(checks.number.positive(3)).to.be.true;
		});
		it('should return false if given number is not positive', () => {
			expect(checks.number.positive(-2)).to.be.false;
		});
	});
	checkApi('number.positive');

	describe('checks.number.negative', () => {
		it('should return true if given number is negative', () => {
			expect(checks.number.negative(-3)).to.be.true;
		});
		it('should return false if given number is not negative', () => {
			expect(checks.number.negative(2)).to.be.false;
		});
	});
	checkApi('number.negative');

	describe('checks.number.above', () => {
		it('should return true if given number is above minimum value', () => {
			expect(checks.number.above(13, 12)).to.be.true;
		});
		it('should return false if given number is not above minimum value', () => {
			expect(checks.number.above(12, 13)).to.be.false;
		});
	});
	checkApi('number.above', ['not']);

	describe('checks.number.under', () => {
		it('should return true if given number is under maximum value', () => {
			expect(checks.number.under(11, 12)).to.be.true;
		});
		it('should return false if given number is not under maximum value', () => {
			expect(checks.number.under(12, 11)).to.be.false;
		});
	});
	checkApi('number.under', ['not']);

	describe('checks.number.within', () => {
		it('should return true if given number is within minimum and maximum values', () => {
			expect(checks.number.within(10, 5, 15)).to.be.true;
		});
		it('should return false if given number is not within minimum and maximum values', () => {
			expect(checks.number.within(20, 5, 15)).to.be.false;
		});
	});
	checkApi('number.within', ['not']);

	describe('checks.number.decimal', () =>  {
		it('should return true if given number is decimal', () => {
			expect(checks.number.decimal(4.2)).to.be.true;
		});
		it('should return false if given number is not decimal', () => {
			expect(checks.number.decimal(2)).to.be.false;
		});
	});
	checkApi('number.decimal');

	describe('checks.number.integer', function() {
		it('should return true if given number is integer', () => {
			expect(checks.number.integer(4)).to.be.true;
		});
		it('should return false if given number is not integer', () => {
			expect(checks.number.integer(2.2)).to.be.false;
		});
	});
	checkApi('number.integer');

	describe('checks.number.finite', () => {
		it('should return true if given number is finite', () => {
			expect(checks.number.finite(4)).to.be.true;
		});
		it('should return false if given number is not finite', () => {
			expect(checks.number.finite(Infinity)).to.be.false;
		});
	});
	checkApi('number.finite');

	describe('checks.number.infinite', () => {
		it('should return true if given number is infinite', () => {
			expect(checks.number.infinite(Infinity)).to.be.true;
		});
		it('should return false if given number is not infinite', () => {
			expect(checks.number.infinite(1)).to.be.false;
			expect(checks.number.infinite(NaN)).to.be.false;
		});
	});
	checkApi('number.infinite');
});
