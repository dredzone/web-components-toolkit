import customElement from '../../lib/web-components/custom-element.js';
import properties from '../../lib/web-components/custom-element-properties.js';
import listenEvent from '../../lib/dom-events/listen-event.js';

class PropertiesTest extends properties(customElement()) {
  static get properties() {
    return {
      prop: {
        type: String,
        value: 'prop',
        reflectToAttribute: true,
        reflectFromAttribute: true,
        observer: () => {},
        notify: true
      },
      fnValueProp: {
        type: Array,
        value: function() {
          return [];
        }
      }
    };
  }
}

PropertiesTest.define('properties-test');

describe('custom-element-properties', () => {
  let container;
  const propertiesTest = document.createElement('properties-test');

  before(() => {
	  container = document.getElementById('container');
      container.append(propertiesTest);
  });

  after(() => {
      container.innerHTML = '';
  });

  it('properties', () => {
    assert.equal(propertiesTest.prop, 'prop');
  });

  it('reflecting properties', () => {
    propertiesTest.prop = 'propValue';
    propertiesTest._flushProperties();
    assert.equal(propertiesTest.getAttribute('prop'), 'propValue');
  });

  it('notify property change', () => {
    listenEvent(propertiesTest, 'prop-changed', evt => {
      assert.isOk(evt.type === 'prop-changed', 'event dispatched');
    });

    propertiesTest.prop = 'propValue';
  });

  it('value as a function', () => {
    assert.isOk(
      Array.isArray(propertiesTest.fnValueProp),
      'function executed'
    );
  });
});
