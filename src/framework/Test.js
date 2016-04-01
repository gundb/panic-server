/*jslint node: true, nomen: true*/
'use strict';

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
	this._events = {};

	if (!cb) {
		cb = name;
		name = 'Anonymous';
	}

	this.ID = String.random(10);
	this.runners = new List();
	this.results = [];
	Test.list[this.ID] = this;

	this.description = name;

	this.config = {
		cbs: [],
		env: {}
	};

	this.on('client-done', function (result) {
		this.results.push(result);
	});

	cb.call(this, this);

	stack.push(this);
}


Test.prototype = new Emitter();
Test.prototype.setMaxListeners(Infinity);

assign(Test.prototype, {
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
	 * Spaghetti plantation
	 **/
	just: function (name, cb, valid) {
		var sent, flag, condition, test = this;
		test.JUST = test.JUST || {min: 0};
		test.JUST.min += 1;
		condition = String(function () {
			return this.env.JUST === "NAME";
		}).replace("NAME", name);
		test.when(condition, cb);
		test.gather(function (client) {
			if (flag || test.JUST[client.PANIC_ID]) {
				return;
			}
			if (valid && !valid(client)) {
				return;
			}
			test.env({ JUST: name });
			client.emit('test', test);
			test.JUST[client.PANIC_ID] = flag = true;
		});
		test.runners.on('add', function () {
			if (test.JUST.min <= test.runners.length) {
				test.run();
			}
		});
		test.on('client-done', function () {
			if (test.results.length === test.runners.length) {
				test.end();
			}
		});
		return this;
	},

	/*
	 * The minimum number of peers
	 * needed to begin the test
	 **/
	needs: function (num, platform) {
		var test = this;
		test.gather(function (client) {
			client.emit('test', test);
		});
		test.runners.on('add', function () {
			if (test.runners.length >= num) {
				test.run();
			}
		});
		test.on('client-done', function () {
			if (test.results.length >= num) {
				test.end();
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
			return this;
		}
		this.hasRun = true;

		this.emit('run', this);
		this.runners.broadcast('run', this.ID);
		return this;
	},

	/*
	 * Marks the test as complete
	 * and notifies watchers.
	 **/
	end: function () {
		if (this.hasEnded) {
			return this;
		}
		this.hasEnded = true;
		this.emit('done', this);
		return this;
	},

	/*
	 * Grab each client as they
	 * come in, until the test begins.
	 * Good for filtering out
	 * clients.
	 **/
	gather: function (cb) {
		var test = this;
		if (test.hasRun) {
			return test;
		}
		test.on('stage', function () {
			server.clients.each(cb).on('add', cb);
			test.on('run', function () {
				server.clients.removeListener('add', cb);
			});
		});

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
	var test = Test.list[testID];
	if (!test.hasRun) {
		test.runners.add(client);
	}
});


/*
 * When a client is done with a test,
 * notify the listeners.
 **/
server.on('done', function (res) {
	Test.list[res.testID].emit('client-done', res);
});

Test.list = {};

module.exports = Test;
