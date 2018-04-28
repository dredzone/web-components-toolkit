import customElement from '../../../lib/custom-elements/mixins/custom-element';
import events from '../../../lib/custom-elements/mixins/events';
import stopEvent from '../../../lib/custom-elements/stop-event';
import removeElement from '../../../lib/dom/remove-element';

class EventsEmitter extends events(customElement()) {
	connected() {
		console.log(this.tagName.toLowerCase(), 'connected');
	}

	disconnected() {
		console.log(this.tagName.toLowerCase(), 'disconnected');
	}
}

class EventsListener extends events(customElement()) {
	connected() {
		console.log(this.tagName.toLowerCase(), 'connected');
	}

	disconnected() {
		console.log(this.tagName.toLowerCase(), 'disconnected');
	}
}

EventsEmitter.define('events-emitter');
EventsListener.define('events-listener');

describe("Events Mixin", () => {
	let container;
	const emmiter = document.createElement('evented-emitter');
	const listener = document.createElement('evented-listener');

	before(() => {
		container = document.getElementById('container');
		listener.append(emmiter);
		container.append(listener);
	});

	afterEach(() => {
		removeElement(emmiter);
		removeElement(listener);
		container.innerHTML = '';
	});
	it("expect emitter to fireEvent and listener to handle an event", () => {
		listener.on('hi', (evt) => {
			stopEvent(evt);
			chai.expect(evt.target).to.equal(emmiter);
			chai.expect(evt.detail).a('object');
			chai.expect(evt.detail).to.deep.equal({body: 'greeting'});
		});
		emmiter.dispatch('hi', {body: 'greeting'});
	});
});