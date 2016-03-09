/*jslint node: true*/
'use strict';

var Response = require('../configuration/Response');
var bump = require('../../server/bump');

function Test(name, cb, time) {
	if (!(this instanceof Test)) {
		return new Test(name, cb);
	}
	if (!cb) {
		cb = name;
	}

	if (typeof name === 'string') {
		this.description = name;
	} else {
		this.description = 'Anonymous';
	}

	this.config = new Response();
	cb.call(this, this);

	/*
		I need some mechanism to kick
		off the test stack.
	*/
}

Test.prototype = {
	constructor: Test,

	server: function (cb, args) {
		this.config.cbs.push({
			conditional: 'typeof global !== "undefined"',
			cb: cb
		});
		return this;
	},

	client: function (cb, args) {
		this.config.cbs.push({
			args: args,
			conditional: 'typeof window !== "undefined"',
			cb: cb
		});
	}
};

module.exports = Test;
