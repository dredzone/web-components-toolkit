import clone, {jsonClone} from '../lib/clone.js';

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

  describe('jsonClone', () => {
    it('When non-serializable value is passed in it throws', () => {
			expect(() => jsonClone()).to.throw(Error);
			expect(() => jsonClone(() => {})).to.throw(Error);
			expect(() => jsonClone(undefined)).to.throw(Error);
    });

		it('Primitive serializable values', () => {
			expect(jsonClone(null)).to.be.null;
			assert.equal(jsonClone(5), 5);
			assert.equal(jsonClone('string'), 'string');
			assert.equal(jsonClone(false), false);
			assert.equal(jsonClone(true), true);
		});

		it('Object is not same', () => {
		  const obj = {'a': 'b'};
			expect(jsonClone(obj)).not.to.be.equal(obj);
		});

		it('Object reviver function', () => {
			const obj = {'a': '2'};
			const cloned = jsonClone(obj, (k, v) => k !== '' ? Number(v) * 2 : v);
			expect(cloned.a).equal(4);
		});
	});
});
