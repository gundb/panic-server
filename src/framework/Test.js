/*jslint node: true*/
'use strict';

var Response = require('../configuration/Response');
var assign = require('object-assign-deep');
var Emitter = require('events');
var stack = require('./stack');

// String.random
require('../configuration/extensions');

function Test(name, cb, time) {
	if (!(this instanceof Test)) {
		return new Test(name, cb);
	}
	if (!cb) {
		cb = name;
	}

	this.ID = String.random();
	this.runners = {};

	if (typeof name === 'string') {
		this.description = name;
	} else {
		this.description = 'Anonymous';
	}

	this.config = new Response();
	cb.call(this, this);

	stack.push(this);
}

// inherit from EventEmitter
Test.prototype = new Emitter();

// superclass the Emitter instance
assign(Test.prototype, {
	constructor: Test,

	env: function (obj) {
		assign(this.config.env, obj);
		return this;
	},

	server: function (cb, args) {
		this.config.cbs.push({
			conditional: 'typeof global !== "undefined"',
			cb: cb
		});
		return this;
	},

	client: function (cb) {
		this.config.cbs.push({
			conditional: 'typeof window !== "undefined"',
			cb: cb
		});
		return this;
	}
});

module.exports = Test;
