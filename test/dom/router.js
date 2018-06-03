import createRouter from '../../lib/dom/router.js';

window.onerror = err => {
	lastError = err;
};

const simulateHashChange = hash => {
	window.location.hash = hash;
	window.dispatchEvent(new Event('hashchange'));
};

describe('router', () => {
	let domEntryPoint;
	let lastError;

	before(() => {
		domEntryPoint = document.createElement('main');
		domEntryPoint.setAttribute('id', 'app');
		document.body.appendChild(domEntryPoint);
	});

	beforeEach(() => {
		domEntryPoint.innerHTML = '';
	});

	afterEach(() => {
		lastError = undefined;
	});

	it('create / start router', () => {
		const router = createRouter(domEntryPoint);
		router.addRoute('', () => {
		});
		router.start();
		simulateHashChange('');
	});
});
