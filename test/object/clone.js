import clone, { jsonClone } from '../../lib/object/clone.js';

describe('Clone', () => {
  describe('primitives', () => {
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

  describe('jsonClone', () => {
    it('When non-serializable value is passed in, returns the same for Null/undefined/functions/etc', () => {
      // Null
      expect(jsonClone(null)).to.be.null;

      // Undefined
      expect(jsonClone()).to.be.undefined;

      // Function
      const func = () => {};
      assert.isFunction(jsonClone(func), 'is a function');

      // Etc: numbers and string
      assert.equal(jsonClone(5), 5);
      assert.equal(jsonClone('string'), 'string');
      assert.equal(jsonClone(false), false);
      assert.equal(jsonClone(true), true);
    });
  });
});
