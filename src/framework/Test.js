/*jslint node: true*/
'use strict';

var Response = require('../configuration/Response');
var assign = require('object-assign-deep');
var Emitter = require('events');
var stack = require('./stack');
var server = require('../../server');
var List = require('./ClientList');

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

	this.ID = String.random(10);
	this.runners = new List();
	Test.list[this.ID] = this;

	if (typeof name === 'string') {
		this.description = name;
	} else {
		this.description = 'Anonymous';
	}

	this.config = new Response();
	cb.call(this, this);

	this.on('peer-done', function (meta) {
		this.runners.remove(meta.clientID);
		if (!this.runners.length) {
			this.end();
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
		if (test.runners.length >= num) {
			return test.run();
		}
		this.runners.on('add', function () {
			if (test.runners.length >= num) {
				test.run();
			}
		});
		return test;
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
		this.emit('done');
		return this;
	},

	/*
	 * Only send a subset of the
	 * test to `JSON.stringify`.
	 **/
	toJSON: function () {
		return {
			ID: this.ID,
			description: this.description,
			config: this.config
		};
	}
});


/*
 * When a client is ready to begin,
 * let the corresponding test know.
 **/
server.on('ready', function (testID, client) {
	Test.list[testID].runners.add(client);
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
