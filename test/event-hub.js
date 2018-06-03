import eventHubFactory from '../lib/event-hub.js';

describe("EventHub methods", () => {

	it("basic pub/sub works", (done) => {
		let myEventHub = eventHubFactory();
		let myEventHubSubscriber = myEventHub.createSubscriber()
			.on('foo', (data) => {
				chai.expect(data).to.equal(1);
				done();
			})
		myEventHub.publish('foo', 1); //should trigger event
	});

	it("multiple subscribers work", () => {
		let myEventHub = eventHubFactory();
		let numCallbacksCalled = 0;
		let myEventHubSubscriber = myEventHub.createSubscriber()
			.on('foo', (data) => {
				numCallbacksCalled++;
				chai.expect(data).to.equal(1);
			})

		let myEventHubSubscriber2 = myEventHub.createSubscriber()
			.on('foo', (data) => {
				numCallbacksCalled++;
				chai.expect(data).to.equal(1);
			})

		myEventHub.publish('foo', 1); //should trigger event
		chai.expect(numCallbacksCalled).to.equal(2);
	});

	it("multiple subscriptions work", () => {
		let myEventHub = eventHubFactory();
		let numCallbacksCalled = 0;
		let myEventHubSubscriber = myEventHub.createSubscriber()
			.on('foo', (data) => {
				numCallbacksCalled++;
				chai.expect(data).to.equal(1);
			})
			.on('bar', (data) => {
				numCallbacksCalled++;
				chai.expect(data).to.equal(2);
			})

		myEventHub.publish('foo', 1); //should trigger event
		myEventHub.publish('bar', 2); //should trigger event
		chai.expect(numCallbacksCalled).to.equal(2);
	});

	it("destroy() works", () => {
		let myEventHub = eventHubFactory();
		let numCallbacksCalled = 0;
		let myEventHubSubscriber = myEventHub.createSubscriber()
			.on('foo', (data) => {
				numCallbacksCalled++;
				throw(new Error('foo should not get called in this test'));
			})
		myEventHub.publish('nothing listening', 2); //should be no-op
		myEventHubSubscriber.destroy();
		myEventHub.publish('foo');  //should be no-op
		chai.expect(numCallbacksCalled).to.equal(0);
	});

	it("off() works", () => {
		let myEventHub = eventHubFactory();
		let numCallbacksCalled = 0;
		let myEventHubSubscriber = myEventHub.createSubscriber()
			.on('foo', (data) => {
				numCallbacksCalled++;
				throw(new Error('foo should not get called in this test'));
			})
			.on('bar', (data) => {
				numCallbacksCalled++;
				chai.expect(data).to.equal(undefined);
			})
			.off('foo')
		myEventHub.publish('nothing listening', 2); //should be no-op
		myEventHub.publish('foo');  //should be no-op
		myEventHub.publish('bar');  //should called
		chai.expect(numCallbacksCalled).to.equal(1);
	});


});