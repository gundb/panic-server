/*jslint node: true*/
'use strict';

var Response = require('../configuration/Response');
var assign = require('object-assign-deep');
var Emitter = require('events');
var stack = require('./stack');
var server = require('../../server');

// String.random
require('../configuration/extensions');

function Test(name, cb) {
	if (!(this instanceof Test)) {
		return new Test(name, cb);
	}
	assign(this, new Emitter());

	if (!cb) {
		cb = name;
	}

	this.ID = String.random();
	this.runners = {};
	Test.list[this.ID] = this;

	if (typeof name === 'string') {
		this.description = name;
	} else {
		this.description = 'Anonymous';
	}

	this.config = new Response();
	cb.call(this, this);

	this.on('client', function (ready, client) {
		var id, potato = client;
		id = ready.clientID;
		this.runners[id] = id;

		client.emit('run', this.ID);
	});

	stack.push(this);
}



assign(Test.prototype, Emitter.prototype, {
	constructor: Test,

	env: function (obj) {
		assign(this.config.env, obj);
		return this;
	},

	when: function (condition, cb) {
		this.config.cbs.push({
			conditional: condition,
			cb: cb
		});
		return this;
	},

	use: function (cb) {
		return this.when(undefined, cb);
	},

	server: function (cb, args) {
		return this.when('typeof global !== "undefined"', cb);
	},

	client: function (cb) {
		return this.when('typeof window !== "undefined"', cb);
	}
});

server.on('ready', function (ready, client) {
	Test.list[ready.testID].emit('client', ready, client);
});

Test.list = {};

module.exports = Test;
