import {expect} from 'chai';
import {is} from '../src/is';

function checkApi(name: string, list: string[]) {
	list = list || ['all', 'any', 'not'];
	['all', 'any', 'not'].forEach((api: string) => {
		let exists = list.indexOf(api) !== -1;
		describe('is.' + api + '.' + name, () => {
			it('should ' + (exists ? '' : 'not ') + 'exist', () => {
				expect(is[api][name]).to[exists ? 'be': 'not'].exist;
			});
		});
	});
}

describe('type checks', () => {
	it('should return true if passed parameter type is arguments', () => {
		let getArguments = () => arguments;
		let args = getArguments('test');
		expect(is.arguments(args)).to.be.true;
	});
	it('should return false if passed parameter type is not arguments', () => {
		const notArgs = ['test'];
		expect(is.arguments(notArgs)).to.be.false;
	});
});

checkApi('arguments');

describe('is.array', () => {
	it('should return true if passed parameter type is array', () => {
		let array = ['test'];
		expect(is.array(array)).to.be.true;
	});
	it('should return false if passed parameter type is not array', () => {
		let notArray = 'test';
		expect(is.array(notArray)).to.be.false;
	});
});

checkApi('array');

describe('is.boolean', () => {
	it('should return true if passed parameter type is boolean', () => {
		let bool = true;
		expect(is.boolean(bool)).to.be.true;
	});
	it('should return false if passed parameter type is not boolean', () => {
		let notBool = 'test';
		expect(is.boolean(notBool)).to.be.false;
	});
});

checkApi('boolean');

describe('is.error', () => {
	it('should return true if passed parameter type is error', () => {
		let error = new Error();
		expect(is.error(error)).to.be.true;
	});
	it('should return false if passed parameter type is not error', () => {
		let notError = 'test';
		expect(is.error(notError)).to.be.false;
	});
});

checkApi('error');

describe('is.function', () => {
	it('should return true if passed parameter type is function', () => {
		expect(is.function(is.function)).to.be.true;
	});
	it('should return false if passed parameter type is not function', () => {
		let notFunction = 'test';
		expect(is.function(notFunction)).to.be.false;
	});
});

checkApi('function');

describe('is.null', () => {
	it('should return true if passed parameter type is null', () => {
		expect(is.null(null)).to.be.true;
	});
	it('should return false if passed parameter type is not null', () => {
		let notNull = 'test';
		expect(is.null(notNull)).to.be.false;
	});
});

checkApi('null');

describe('is.number', () => {
	it('should return true if passed parameter type is number', () => {
		expect(is.number(1)).to.be.true;
	});
	it('should return false if passed parameter type is not number', () => {
		let notNumber = 'test';
		expect(is.number(notNumber)).to.be.false;
	});
});

checkApi('number');

describe('is.object', () => {
	it('should return true if passed parameter type is object', () => {
		expect(is.object({})).to.be.true;
	});
	it('should return false if passed parameter type is not object', () => {
		let notObject = 'test';
		expect(is.object(notObject)).to.be.false;
	});
});

checkApi('object');
