import clone from '../../lib/object/clone.js';

describe('clone', () => {
	it('Returns equal data for Null/undefined/functions/etc', () => {
		// Null
		expect(clone(null)).to.be.null;

		// Undefined
		expect(clone()).to.be.undefined;

		// Function
		const func = () => {};
		assert.isFunction(clone(func), 'is a function');

		// Etc: numbers and string
		assert.equal(clone(5), 5);
		assert.equal(clone('string'), 'string');
		assert.equal(clone(false), false);
		assert.equal(clone(true), true);
	});
});
