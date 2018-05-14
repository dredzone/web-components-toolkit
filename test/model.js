import model from '../lib/model.js';

class Model extends model() {
	get defaultState() {
    return {foo:1};
  }
}

describe("Model methods", () => {

	it("defaultState works", () => {
		let myModel = new Model();
    chai.expect(myModel.get('foo')).to.equal(1);
	});

	it("get()/set() works", () => {
		let myModel = new Model().set('foo',2);
    chai.expect(myModel.get('foo')).to.equal(2);
	});

	it("deep get()/set() works", () => {
		let myModel = new Model().set({
			deepObj1: {
				deepObj2: 1
			}
		});
		myModel.set('deepObj1.deepObj2',2);
    chai.expect(myModel.get('deepObj1.deepObj2')).to.equal(2);
	});

	it("deep get()/set() with arrays work", () => {
		let myModel = new Model().set({
			deepObj1: {
				deepObj2: []
			}
		});
		myModel.set('deepObj1.deepObj2.0','dog');
    chai.expect(myModel.get('deepObj1.deepObj2.0')).to.equal('dog');
		myModel.set('deepObj1.deepObj2.0',{foo:1});
		chai.expect(myModel.get('deepObj1.deepObj2.0.foo')).to.equal(1);
		myModel.set('deepObj1.deepObj2.0.foo',2);
		chai.expect(myModel.get('deepObj1.deepObj2.0.foo')).to.equal(2);
	});

	it("subscriptions works", () => {
		let myModel = new Model().set({
			deepObj1: {
				deepObj2: [{
					selected:false
				},
				{
					selected:true
				}]
			}
		});
		const TEST_SEL = 'deepObj1.deepObj2.0.selected';

		const myModelSubscriber = myModel.createSubscriber();
		let numCallbacksCalled = 0;

		myModelSubscriber.on(TEST_SEL, function(newValue, oldValue) {
			numCallbacksCalled++;
			chai.expect(newValue).to.equal(true);
			chai.expect(oldValue).to.equal(false);
		});

		myModelSubscriber.on('deepObj1', function(newValue, oldValue) {
			numCallbacksCalled++;
			throw('no subscriber should be called for deepObj1');
		});

		myModelSubscriber.on('deepObj1.*', function(newValue, oldValue) {
			numCallbacksCalled++;
			chai.expect(newValue.deepObj2[0].selected).to.equal(true);
			chai.expect(oldValue.deepObj2[0].selected).to.equal(false);
		});

		myModel.set(TEST_SEL, true);
		myModelSubscriber.destroy();
		chai.expect(numCallbacksCalled).to.equal(2);

	});

	it("subscribers can be destroyed", () => {
		let myModel = new Model().set({
			deepObj1: {
				deepObj2: [{
					selected:false
				},
				{
					selected:true
				}]
			}
		});
		myModel.TEST_SEL = 'deepObj1.deepObj2.0.selected';

		const myModelSubscriber = myModel.createSubscriber();

		myModelSubscriber.on(myModel.TEST_SEL, function(newValue, oldValue) {
			throw(new Error('should not be observed'));
		});
		myModelSubscriber.destroy();
		myModel.set(myModel.TEST_SEL, true);
	});

	it("properties bound from model to custom element", () => {
		let myModel = new Model();
    chai.expect(myModel.get('foo')).to.equal(1);

    let myElement = document.createElement('properties-mixin-test');

    const observer = myModel.createSubscriber()
      .on('foo', (value) => { this.prop = value; });
    observer.destroy();

    const propertyBinder = myModel.createPropertyBinder(myElement).addBindings(
      ['foo', 'prop']
    );

    myModel.set('foo', '3');
    chai.expect(myElement.prop).to.equal('3');
    propertyBinder.destroy();
		myModel.set('foo', '2');
		chai.expect(myElement.prop).to.equal('3');
	});

});
