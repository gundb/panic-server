/*jslint node: true*/
'use strict';

var assign = require('object-assign-deep');

function Context(test) {
	this.env = {};
	if (test instanceof Object) {
		assign(this.env, test.env);
		if (typeof test.timeout === 'number') {
			this.timeout = test.timeout || this.timeout;
		}
	}
}

Context.prototype = {
	constructor: Context,

	// default timeout
	timeout: 15000,
	done: function () {}
};

module.exports = Context;
