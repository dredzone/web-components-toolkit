import customElement from '../../../lib/browser/web-components/custom-element-mixin.js';
import properties from '../../../lib/browser/web-components/properties-mixin.js';
import listenEvent from '../../../lib/browser/listen-event.js';

class PropertiesMixinTest extends properties(customElement()) {
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

PropertiesMixinTest.define('properties-mixin-test');

describe('properties-mixin', () => {
  let container;
  const propertiesMixinTest = document.createElement('properties-mixin-test');

  before(() => {
	  container = document.getElementById('container');
      container.append(propertiesMixinTest);
  });

  after(() => {
      container.innerHTML = '';
  });

  it('properties', () => {
    assert.equal(propertiesMixinTest.prop, 'prop');
  });

  it('reflecting properties', () => {
    propertiesMixinTest.prop = 'propValue';
    propertiesMixinTest._flushProperties();
    assert.equal(propertiesMixinTest.getAttribute('prop'), 'propValue');
  });

  it('notify property change', () => {
    listenEvent(propertiesMixinTest, 'prop-changed', evt => {
      assert.isOk(evt.type === 'prop-changed', 'event dispatched');
    });

    propertiesMixinTest.prop = 'propValue';
  });

  it('value as a function', () => {
    assert.isOk(
      Array.isArray(propertiesMixinTest.fnValueProp),
      'function executed'
    );
  });
});