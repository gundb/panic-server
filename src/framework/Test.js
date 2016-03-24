/*jslint node: true*/
'use strict';

var Response = require('../configuration/Response');
var assign = require('object-assign-deep');
var Emitter = require('events');
var stack = require('./stack');
var server = require('../../server');

// String.random
require('../configuration/extensions');

function clients(test) {
	var keys, length;
	keys = Object.keys(test.runners);
	return keys.filter(function (ID) {
		return server.clients[ID];
	});
}

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

	this.on('client', function (ID, client) {
		this.runners[ID] = false;
	});

	this.config = new Response();
	cb.call(this, this);

	this.on('peer-done', function (meta) {
		var length, keys, test = this;
		test.runners[meta.clientID] = 'done';
		keys = clients(test);
		length = keys.filter(function (ID) {
			return test.runners[ID];
		}).length;
		if (length === keys.length) {
			test.emit('done');
		}
	});

	stack.push(this);
}



assign(Test.prototype, Emitter.prototype, {
	constructor: Test,

	/*
	 * Send variables to test callbacks.
	 **/
	env: function (obj) {
		assign(this.config.env, obj);
		return this;
	},

	/*
	 * Run a callback under a condition.
	 **/
	when: function (condition, cb) {
		this.config.cbs.push({
			conditional: condition,
			cb: cb
		});
		return this;
	},

	/*
	 * Run a callback on every platform.
	 **/
	use: function (cb) {
		return this.when(undefined, cb);
	},

	/*
	 * Only run a callback on servers.
	 **/
	server: function (cb, args) {
		return this.when(function () {
			return typeof process !== 'undefined';
		}, cb);
	},

	/*
	 * Only run a callback on browsers.
	 **/
	client: function (cb) {
		return this.when(function () {
			return typeof window !== 'undefined';
		}, cb);
	},

	/*
	 * The minimum number of peers
	 * needed to begin the test
	 **/
	peers: function (num) {
		var test = this;
		this.on('client', function () {
			var length = clients(test).length;
			if (length >= num) {
				test.run();
			}
		});
		return this;
	},

	/*
	 * Begins the test and makes
	 * sure that it only fires once.
	 **/
	run: function () {
		if (this.hasRun) {
			return;
		}
		this.hasRun = true;
		server.emit('run', this.ID);
		return this;
	},

	/*
	 * Marks the test as complete
	 * and notifies watchers.
	 **/
	end: function () {
		if (this.hasEnded) {
			return;
		}
		this.hasEnded = true;
		server.emit('done');
		return this;
	}
});


/*
 * When a client is ready to begin,
 * let the corresponding test know.
 **/
server.on('ready', function (testID, client) {
	Test.list[testID].emit('client', client.PANIC_ID, client);
});


/*
 * When a client is done with a test,
 * notify the listeners.
 **/
server.on('done', function (res) {
	Test.list[res.testID].emit('peer-done', res);
});

Test.list = {};

module.exports = Test;
