/*  */

const on = (target, type, listener, capture = false) => {
	return parse(target, type, listener, capture);
};

on.once = function (target, type, listener) {
	let handle = on(target, type, () => {
		handle.remove();
		listener.apply(this, arguments);
	});
	return handle;
};

on.pausable = function (target, type, listener, capture) {
	let paused;
	let handle = on(target, type, function () {
		if (!paused) {
			listener.apply(this, arguments);
		}
	}, capture);

	return {
		remove() {
			handle.remove();
		},
		pause() {
			paused = true;
		},
		resume() {
			paused = false;
		}
	};
};

export default on;

function addListener(target, type, listener, capture) {
	if (target.addEventListener) {
		target.addEventListener(type, listener, capture);
		return {
			remove: function () {
				this.remove = () => {};
				target.removeEventListener(type, listener, capture);
			}
		};
	}
	throw new Error('target must be an event emitter');
}

function parse(target, type, listener, capture) {
	if (type.indexOf(',') > -1) {
		let events = type.split(/\s*,\s*/);
		let handles = events.map(function (type) {
			return addListener(target, type, listener, capture);
		});
		return {
			remove() {
				this.remove = () => {};
				let handle;
				while ((handle = handles.pop())) {
					handle.remove();
				}
			}
		};
	}
	return addListener(target, type, listener, capture);
}
