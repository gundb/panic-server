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

	cb.call(this, this);

	if (!this.listenerCount('stage')) {
		var test = this;
		this.on('stage', function () {
			this.gather(function (client) {
				client.emit('test', test);
			});
		});
	}

	this.on('peer-done', function (result) {
		this.results.push(result);
		var client, passed = true;
		client = this.runners[result.clientID];
		if (result.error) {
			passed = false;
			console.log(
				'Failure (' + client.platform.name + '):',
				result.error.message
			);
		}
		if (this.results.length === this.runners.length) {
			if (passed) {
				console.log('Test "' + this.description + '" passed.');
			}
			this.end();
		}
	});

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
			return this;
		}
		this.hasRun = true;

		console.log('Running:', this.description);

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
		if (this.hasRun) {
			return this;
		}
		server.clients.each(cb).on('add', cb);
		return this.on('run', function () {
			server.clients.removeListener('add', cb);
		});
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
