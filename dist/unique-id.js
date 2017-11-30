define(["exports"], function (exports) {
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	/**
  * A helper function for generating unique ids based on Data.now
  */
	var prevTimeId = 0;
	var prevUniqueId = 0;

	var uniqueId = exports.uniqueId = function uniqueId() {
		var newUniqueId = Date.now();
		if (newUniqueId === prevTimeId) {
			++prevUniqueId;
		} else {
			prevTimeId = newUniqueId;
			prevUniqueId = 0;
		}
		return Number("" + String(newUniqueId) + String(prevUniqueId));
	};
});