import type from '../../lib/is/type';

describe('IsType checks', () => {
	describe('arguments', () => {
		it('should return true if passed parameter type is arguments', () => {
			let args = getArguments('test');
			expect(type.is.arguments(args)).to.be.true;

			function getArguments() {
				return arguments;
			}
		});
		it('should return false if passed parameter type is not arguments', () => {
			const notArgs = ['test'];
			expect(type.is.arguments(notArgs)).to.be.false;
		});
	});

	describe('array', () => {
		it('should return true if passed parameter type is array', () => {
			let array = ['test'];
			expect(type.is.array(array)).to.be.true;
		});
		it('should return false if passed parameter type is not array', () => {
			let notArray = 'test';
			expect(type.is.array(notArray)).to.be.false;
		});
	});

	describe('boolean', () => {
		it('should return true if passed parameter type is boolean', () => {
			let bool = true;
			expect(type.is.boolean(bool)).to.be.true;
		});
		it('should return false if passed parameter type is not boolean', () => {
			let notBool = 'test';
			expect(type.is.boolean(notBool)).to.be.false;
		});
	});

	describe('error', () => {
		it('should return true if passed parameter type is error', () => {
			let error = new Error();
			expect(type.is.error(error)).to.be.true;
		});
		it('should return false if passed parameter type is not error', () => {
			let notError = 'test';
			expect(type.is.error(notError)).to.be.false;
		});
	});

	describe('function', () => {
		it('should return true if passed parameter type is function', () => {
			expect(type.is.function(type.is.function)).to.be.true;
		});
		it('should return false if passed parameter type is not function', () => {
			let notFunction = 'test';
			expect(type.is.function(notFunction)).to.be.false;
		});
	});

	describe('null', () => {
		it('should return true if passed parameter type is null', () => {
			expect(type.is.null(null)).to.be.true;
		});
		it('should return false if passed parameter type is not null', () => {
			let notNull = 'test';
			expect(type.is.null(notNull)).to.be.false;
		});
	});

	describe('number', () => {
		it('should return true if passed parameter type is number', () => {
			expect(type.is.number(1)).to.be.true;
		});
		it('should return false if passed parameter type is not number', () => {
			let notNumber = 'test';
			expect(type.is.number(notNumber)).to.be.false;
		});
	});

	describe('object', () => {
		it('should return true if passed parameter type is object', () => {
			expect(type.is.object({})).to.be.true;
		});
		it('should return false if passed parameter type is not object', () => {
			let notObject = 'test';
			expect(type.is.object(notObject)).to.be.false;
		});
	});

	describe('regexp', () => {
		it('should return true if passed parameter type is regexp', () => {
			let regexp = new RegExp();
			expect(type.is.regexp(regexp)).to.be.true;
		});
		it('should return false if passed parameter type is not regexp', () => {
			let notRegexp = 'test';
			expect(type.is.regexp(notRegexp)).to.be.false;
		});
	});
	describe('string', () => {
		it('should return true if passed parameter type is string', () => {
			expect(type.is.string('test')).to.be.true;
		});
		it('should return false if passed parameter type is not string', () => {
			expect(type.is.string(1)).to.be.false;
		});
	});

	describe('undefined', () => {
		it('should return true if passed parameter type is undefined', () => {
			expect(type.is.undefined(undefined)).to.be.true;
		});
		it('should return false if passed parameter type is not undefined', () => {
			expect(type.is.undefined(null)).to.be.false;
			expect(type.is.undefined('test')).to.be.false;
		});
	});
});
