import customElement from '../../lib/web-components/custom-element.js';
import events from '../../lib/web-components/custom-element-events.js';
import stopEvent from '../../lib/dom-events/stop-event.js';

class EventsEmitter extends events(customElement()) {
  connected() {}

  disconnected() {}
}

class EventsListener extends events(customElement()) {
  connected() {}

  disconnected() {}
}

EventsEmitter.define('events-emitter');
EventsListener.define('events-listener');

describe('custom-element-events', () => {
  let container;
  const emmiter = document.createElement('events-emitter');
  const listener = document.createElement('events-listener');

  before(() => {
    container = document.getElementById('container');
    listener.append(emmiter);
    container.append(listener);
  });

  after(() => {
    container.innerHTML = '';
  });

  it('expect emitter to fireEvent and listener to handle an event', () => {
    listener.on('hi', evt => {
      stopEvent(evt);
      chai.expect(evt.target).to.equal(emmiter);
      chai.expect(evt.detail).a('object');
      chai.expect(evt.detail).to.deep.equal({ body: 'greeting' });
    });
    emmiter.dispatch('hi', { body: 'greeting' });
  });
});
