'use strict';
var Emitter = require('events');
var match = require('./matcher');
var Promise = require('bluebird');
var util = require('util');

function ClientList(lists) {
	var list = this;
	Emitter.call(this);
	list.clients = {};
	var add = list.add.bind(list);
	if (lists instanceof Array) {
		lists.forEach(function (list) {
			list.each(add).on('add', add);
		});
	}
}

var API = ClientList.prototype = new Emitter();
API.setMaxListeners(Infinity);

API.constructor = ClientList;

API.chain = function (list) {
	return new this.constructor(list);
};

API.each = function (cb) {
	var key;
	for (key in this.clients) {
		if (this.clients.hasOwnProperty(key)) {
			cb(this.clients[key], key, this);
		}
	}
	return this;
};

API.add = function (client) {
	var socket, list = this;
	socket = client.socket;
	if (!socket.connected || this.get(socket.id)) {
		return this;
	}
	this.clients[socket.id] = client;
	socket.on('disconnect', function () {
		list.remove(client);
	});
	this.emit('add', client, socket.id);
	return this;
};

API.remove = function (client) {
	if (client.socket.id in this.clients) {
		delete this.clients[client.socket.id];
		this.emit('remove', client, client.socket.id);
	}
	return this;
};

API.get = function (ID) {
	return this.clients[ID] || null;
};

API.filter = function (query) {
	var list = this.chain();
	function filter(client, ID) {
		if (query instanceof Function && query(client, ID)) {
			list.add(client);
			return;
		} else if (typeof query === 'string' || query instanceof RegExp) {
			query = {
				name: query
			};
		}
		if (typeof query === 'object' && query) {
			if (match(query, client.platform)) {
				list.add(client);
			}
		}
	}
	this.each(filter).on('add', filter);
	return list;
};

API.excluding = function (exclude) {
	var self, list = this.filter(function (client) {
		return !exclude.get(client.socket.id);
	});
	self = this;
	exclude.on('remove', function (client) {
		if (client.socket.connected && self.get(client.socket.id)) {
			list.add(client);
		}
	});
	return list;
};

API.len = util.deprecate(function () {
	return this.length;
}, 'Use `.length` instead of `.len()`');

API.run = function (cb, scope) {
	var key, done = 0, list = this, length = this.length;
	key = Math.random()
	.toString(36)
	.slice(2);

	return new Promise(function (resolve, reject) {
		function count(err) {
			if (err) {
				reject(err);
			} else if ((done += 1) >= length) {
				resolve(list);
			}
		}
		function add() {
			count(null);
		}
		list.each(function (client) {
			client.socket
			.on(key, function (err) {
				count(err);
				client.socket.removeListener('disconnect', add);
			})
			.once('disconnect', add)
			.emit('run', String(cb), key, scope);
		});
	});
};

API.atLeast = function (min) {
	var list = this;

	if (list.length >= min) {
		return Promise.resolve();
	}

	return new Promise(function (resolve) {
		list.on('add', function cb () {
			if (list.length >= min) {
				list.removeListener('add', cb);
				resolve();
			}
		});
	});
};

API.pluck = function (num) {
	var self, list = this.chain();
	self = this;
	function measure(client) {
		if (!list.atCapacity) {
			list.add(client);
		}
	}
	list.on('add', function () {
		if (list.length === num) {
			list.atCapacity = true;
		}
	});
	list.on('remove', function () {
		list.atCapacity = false;
		self.each(measure);
	});
	this.each(measure)
	.on('add', measure);
	return list;
};

API.atCapacity = false;

Object.defineProperty(API, 'length', {
	get: function () {
		if (Object.keys instanceof Function) {
			return Object.keys(this.clients).length;
		}
		var num = 0;
		this.each(function () {
			num += 1;
		});
		return num;
	}
});

module.exports = ClientList;
