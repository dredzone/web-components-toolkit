import clone from '../lib/clone.js';

describe('clone', () => {
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

  describe('clone.json', () => {
    it('When non-serializable value is passed in it throws', () => {
			expect(() => clone.json()).to.throw(Error);
			expect(() => clone.json(() => {})).to.throw(Error);
			expect(() => clone.json(undefined)).to.throw(Error);
    });

		it('Primitive serializable values', () => {
			expect(clone.json(null)).to.be.null;
			assert.equal(clone.json(5), 5);
			assert.equal(clone.json('string'), 'string');
			assert.equal(clone.json(false), false);
			assert.equal(clone.json(true), true);
		});

		it('Object is not same', () => {
		  const obj = {'a': 'b'};
			expect(clone.json(obj)).not.to.be.equal(obj);
		});

		it('Object reviver function', () => {
			const obj = {'a': '2'};
			const cloned = clone.json(obj, (k, v) => k !== '' ? Number(v) * 2 : v);
			expect(cloned.a).equal(4);
		});
	});
});
