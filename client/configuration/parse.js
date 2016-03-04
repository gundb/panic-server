/*jslint node: true*/
'use strict';

// provides `Function.parse`
require('../../lib/configuration/extensions');

function condition(obj) {

	// immediate pass
	if (obj.conditional === undefined) {
		return true;
	}

	// parse the conditional
	var result = Function.parse(obj.conditional);

	// if it's a primitive
	if (typeof result !== 'function') {
		return Boolean(result);
	}

	// it's a function
	return result();
}

module.exports = function (array) {
	if (!array) {
		return [];
	}
	return array.filter(condition).map(function (obj) {
		// parse the callbacks
		obj.cb = Function.parse(obj.cb);
		return obj;
	}).filter(function (obj) {
		// filter out non-functions
		return typeof obj.cb === 'function';
	});
};
