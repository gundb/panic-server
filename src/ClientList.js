'use strict';
var Emitter = require('events');
var match = require('./matcher');
var Promise = require('bluebird');
function ClientList() {
	Emitter.call(this);
	this.clients = {};
}

Function.prototype.toJSON = Function.prototype.toString;
var API = ClientList.prototype = new Emitter();

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
	var list = this;
	if (!client.socket.connected) {
		return this;
	}
	this.clients[client.socket.id] = client;
	client.socket.on('disconnect', function () {
		list.remove(client);
	});
	this.emit('add', client, client.socket.id);
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
	var list = new ClientList();
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
	return this.filter(function (client) {
		return !exclude.get(client.socket.id);
	});
};

API.len = function () {
	if (Object.keys instanceof Function) {
		return Object.keys(this.clients).length;
	}
	var num = 0;
	this.each(function () {
		num += 1;
	});
	return num;
};

API.run = function (cb, scope) {
	var key, done = 0, list = this, length = this.len();
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
			.emit('run', cb, key, scope);
		});
	});
};

module.exports = ClientList;
