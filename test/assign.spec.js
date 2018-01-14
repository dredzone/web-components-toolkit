import {assert} from 'chai';
import {objectAssign} from '../lib/object-assign.utility';

describe('objectAssign', () => {
	it('should return true', () => {
		let target = {4: 'd'};
		let source1 = {1: 'a', 2: 'b', 3: 'c'};
		let source2 = null;
		objectAssign(target, source1, source2);
		assert.isOk(Boolean(JSON.stringify(target) === '{"1":"a","2":"b","3":"c","4":"d"}'));
	});
});
