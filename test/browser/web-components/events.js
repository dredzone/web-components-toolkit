import customElement from '../../../lib/browser/web-components/custom-element-mixin.js';
import events from '../../../lib/browser/web-components/events-mixin.js';
import stopEvent from '../../../lib/browser/stop-event.js';
import removeElement from '../../../lib/browser/remove-element.js';

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

describe('events-mixin', () => {
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
