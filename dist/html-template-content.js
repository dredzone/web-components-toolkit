define(['exports', './checks/type.checks'], function (exports, _type) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.htmlTemplateContent = undefined;
	var htmlTemplateContent = exports.htmlTemplateContent = function htmlTemplateContent(template) {
		if (_type.typeChecks.string(template)) {
			template = document.querySelector(template);
		}

		if (_type.typeChecks.domNode(template)) {
			if ('content' in document.createElement('template')) {
				return document.importNode(template.content, true);
			}

			var fragment = document.createDocumentFragment();
			var children = template.childNodes;
			for (var i = 0; i < children.length; i++) {
				fragment.appendChild(children[i].cloneNode(true));
			}
			return fragment;
		}

		throw new Error('template must be a valid querySelector or domNode');
	};
});