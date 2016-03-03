/*jslint node: true*/
'use strict';

var Context = require('./Context');
var bump = require('../../server/bump');
var stack = [];

function done() {
	stack.pop();
	var next = stack.slice(-1)[0];
	if (next) {
		bump(next, done);
	}
}

function Test(name, cb, time) {
	if (!(this instanceof Test)) {
		return new Test(name, cb);
	}
	if (!cb) {
		cb = name;
	}

	if (typeof name === 'string') {
		this.description = name;
	}

	var ctx = new Context(this);
	stack.push(ctx);
	cb.call(ctx, ctx);
	bump(ctx, done);
}

module.exports = Test;
