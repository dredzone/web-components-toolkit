import createElement from '../../lib/browser/create-element.js';

it('create-element', () => {
	const el = createElement(`
		<div class="my-class">Hello World</div>
	`);
	expect(el.classList.contains('my-class')).to.equal(true);
	assert.instanceOf(el, Node, 'element is instance of node');
});
