import {even, odd, positive, negative, above, under,
	finite, infinite, integer, within, decimal} from '../../lib/is/number';

describe('IsNumber checks', () => {
	describe('even', () => {
		it('should return true if given number is even', () => {
			expect(even(2)).to.be.true;
		});
		it('should return false if given number is not even', () => {
			expect(even(3)).to.be.false;
		});
		it('should return false if given number is not integer', () => {
			expect(even(2.5)).to.be.false;
		});
	});

	describe('odd', () => {
		it('should return true if given number is odd', () => {
			expect(odd(3)).to.be.true;
		});
		it('should return true if given number is negative odd', () => {
			expect(odd(-3)).to.be.true;
		});
		it('should return false if given number is not odd', () => {
			expect(odd(2)).to.be.false;
		});
		it('should return false if given number is not integer', () => {
			expect(odd(2.5)).to.be.false;
		});
	});

	describe('positive', () => {
		it('should return true if given number is positive', () => {
			expect(positive(3)).to.be.true;
		});
		it('should return false if given number is not positive', () => {
			expect(positive(-2)).to.be.false;
		});
	});

	describe('negative', () => {
		it('should return true if given number is negative', () => {
			expect(negative(-3)).to.be.true;
		});
		it('should return false if given number is not negative', () => {
			expect(negative(2)).to.be.false;
		});
	});

	describe('above', () => {
		it('should return true if given number is above minimum value', () => {
			expect(above(13, 12)).to.be.true;
		});
		it('should return false if given number is not above minimum value', () => {
			expect(above(12, 13)).to.be.false;
		});
	});

	describe('under', () => {
		it('should return true if given number is under maximum value', () => {
			expect(under(11, 12)).to.be.true;
		});
		it('should return false if given number is not under maximum value', () => {
			expect(under(12, 11)).to.be.false;
		});
	});

	describe('within', () => {
		it('should return true if given number is within minimum and maximum values', () => {
			expect(within(10, 5, 15)).to.be.true;
		});
		it('should return false if given number is not within minimum and maximum values', () => {
			expect(within(20, 5, 15)).to.be.false;
		});
	});

	describe('decimal', () =>  {
		it('should return true if given number is decimal', () => {
			expect(decimal(4.2)).to.be.true;
		});
		it('should return false if given number is not decimal', () => {
			expect(decimal(2)).to.be.false;
		});
	});

	describe('integer', function() {
		it('should return true if given number is integer', () => {
			expect(integer(4)).to.be.true;
		});
		it('should return false if given number is not integer', () => {
			expect(integer(2.2)).to.be.false;
		});
	});

	describe('finite', () => {
		it('should return true if given number is finite', () => {
			expect(finite(4)).to.be.true;
		});
		it('should return false if given number is not finite', () => {
			expect(finite(Infinity)).to.be.false;
		});
	});

	describe('infinite', () => {
		it('should return true if given number is infinite', () => {
			expect(infinite(Infinity)).to.be.true;
		});
		it('should return false if given number is not infinite', () => {
			expect(infinite(1)).to.be.false;
			expect(infinite(NaN)).to.be.false;
		});
	});
});