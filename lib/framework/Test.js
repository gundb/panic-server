/*jslint node: true*/
'use strict';

var Context = require('./Context');
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

	var ctx = new Context(this);
	cb.call(ctx, ctx);

	/*
		I need some mechanism to kick
		off the test stack.
	*/
}

module.exports = Test;
