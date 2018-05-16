import jsonClone from '../../lib/object/json-clone.js';

describe('json-clone', () => {
	it('non-serializable values throw', () => {
		expect(() => jsonClone()).to.throw(Error);
		expect(() => jsonClone(() => {})).to.throw(Error);
		expect(() => jsonClone(undefined)).to.throw(Error);
	});

	it('primitive serializable values', () => {
		expect(jsonClone(null)).to.be.null;
		assert.equal(jsonClone(5), 5);
		assert.equal(jsonClone('string'), 'string');
		assert.equal(jsonClone(false), false);
		assert.equal(jsonClone(true), true);
	});

	it('object cloned', () => {
		const obj = {'a': 'b'};
		expect(jsonClone(obj)).not.to.be.equal(obj);
	});

	it('reviver function', () => {
		const obj = {'a': '2'};
		const cloned = jsonClone(obj, (k, v) => k !== '' ? Number(v) * 2 : v);
		expect(cloned.a).equal(4);
	});
});