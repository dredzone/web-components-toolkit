import customElement from '../../../lib/web-components/mixins/custom-element';
import properties from '../../../lib/web-components/mixins/properties';
import on from '../../../lib/web-components/on';

class PropertiesMixinTest extends properties(customElement()) {
	connected() {
		console.log(this.tagName, 'connected');
	}

	disconnected() {
		console.log(this.tagName, 'disconnected');
	}

	static get properties() {
		return {
			prop: {
				type: String,
				value: "prop",
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

describe("Properties Mixin", () => {
	let container;
	const propertiesMixinTest = document.createElement('properties-mixin-test');

	before(() => {
		container = document.getElementById('container');
		container.append(propertiesMixinTest);
	});

	afterEach(() => {
		setTimeout(() => {
			// container.remove(propertiesMixinTest);
			// container.innerHTML = '';
		});
	});

	it("properties", () => {
		assert.equal(propertiesMixinTest.prop, 'prop');
	});

	it('reflecting properties', () => {
		propertiesMixinTest.propertiesChanged = function() {
			console.log(arguments);
			// assert.equal(propertiesMixinTest.getAttribute('prop'), 'propValue');
		};
		propertiesMixinTest.prop = 'propValue';
	});

	it('notify property change', () => {
		on(propertiesMixinTest, 'prop-changed', (evt) => {
			assert.isOk(evt.type === 'prop-changed', 'event dispatched');
		});

		propertiesMixinTest.prop = 'propValue';
	});

	it('value as a function', () => {
		assert.isOk(Array.isArray(propertiesMixinTest.fnValueProp), 'function executed');
	});
});