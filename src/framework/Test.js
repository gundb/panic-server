/*jslint node: true, nomen: true, regexp: true*/
'use strict';

var assign = require('object-assign-deep');
var Emitter = require('events');
var stack = require('./stack');
var server = require('../../server');
var List = require('./ClientList');
var Agreement = require('./Agree');

function match(exp, platform) {
  var key, matching = true;

  for (key in exp) {
    if (exp.hasOwnProperty(key)) {
      if (!platform || !platform.hasOwnProperty(key)) {
        return false;
      }
      if (exp[key] instanceof RegExp) {
        matching = matching && exp[key].test(platform[key]);
      } else if (exp[key] instanceof Object) {
        matching = matching && match(exp[key], platform[key]);
      } else {
        matching = matching && exp[key] === platform[key];
      }
    }
  }

	return matching;
}


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

	this.agreement = new Agreement();
	this.run = this.run.bind(this);
	this.end = this.end.bind(this);
	this.ID = String.random(10);
	this.runners = new List();
	this.results = [];
	Test.list[this.ID] = this;

	this.description = name;

	this.config = {
		cbs: [],
		env: {}
	};

	this.on('result', function (result) {
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
	 * Send tests to a client subset
	 * and measure their results against
	 * "result" events.
	 **/
	just: function (runners, cb) {
		var just, test = this;
		just = test.JUST = test.JUST || {min: 0};
		function decide(result) {
			return result.length >= just.min;
		}
		test.agreement
			.join('should run', decide)
			.join('should end', decide);

		test.on('run', function () {
			just.min += runners.length;
			runners.broadcast('run', test.ID);
		});
		runners.on('add', function (client) {
			client.emit('test', test);
			test.run();
		});
		return test.on('result', test.end);
	},

	/*
	 * The minimum number of peers
	 * needed to begin the test
	 **/
	needs: function (num, runners) {
		var test = this;
		runners = runners || /./;
		runners = runners instanceof List ? runners : this.matching(runners);
		test.on('run', function (client) {
			runners.broadcast('run', test.ID);
		});
		test.agreement.join('should run', function () {
			return runners.length >= num;
		});
		runners.on('add', function (client) {
			client.emit('test', test);
			test.run();
		});
		return test.on('result', test.end);
	},

	/*
	 * Begins the test and makes
	 * sure that it only fires once.
	 **/
	run: function () {
		var agrees = this.agreement.all('should run', this.runners);
		if (this.hasRun || !agrees) {
			return this;
		}
		this.hasRun = true;

		this.emit('run', this);
		return this;
	},

	/*
	 * Marks the test as complete
	 * and notifies watchers.
	 **/
	end: function () {
		var agrees = this.agreement.all('should end', this.results);
		if (this.hasEnded || !agrees) {
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
	 * Return a client list matching
	 * a platform description. It will
	 * update as clients join and leave.
	 **/
	matching: function (exp) {
		var list, test = this;
		list = new List();
		if (!(exp instanceof Object) || exp instanceof RegExp) {
			exp = {
				name: exp
			};
		}
		this.gather(function (client, ID) {
			console.log('New client found');
			if (match(exp, client.platform)) {
				console.log('Match found:', exp);
				list.add(client);
			}
		});
		return list;
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
server.on('done', function (result) {
	Test.list[result.testID].emit('result', result);
});

Test.list = {};

module.exports = Test;
