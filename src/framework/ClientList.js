/*jslint node: true, es5: true, continue: true, forin: true*/
'use strict';

var assign = require('object-assign-deep');
var Emitter = require('events');

function ClientList(socket) {
	assign(this, new Emitter());
}

ClientList.prototype = {
	constructor: ClientList,

	/*
	 * Add a client and keep the
	 * list updated as they disconnect
	 **/
	add: function (client) {
		var ID, list = this;

		if (!client.connected) {
			return list;
		}

		ID = client.PANIC_ID;

		if (!ID) {
			throw new Error('PanicError: No panic ID provided.');
		}

		list[ID] = client;
		list.emit('add', client, ID);

		client.on('disconnect', function () {
			list.remove(ID);
		});

		return list;
	},

	/*
	 * Removes a peer from the
	 * list, and emits 'remove'
	 * if it existed.
	 **/
	remove: function (ID) {
		var client = this[ID];
		if (!client) {
			return this;
		}
		delete this[ID];
		this.emit('remove', client, ID);
		return this;
	},

	/*
	 * Iterate over each connected
	 * test client.
	 **/
	each: function (cb) {

		var key, list = this;

		// filter out emitter properties
		for (key in list) {

			// filter out unwanted properties
			if (!list.hasOwnProperty(key)) {
				continue;
			}
			if (!list[key] || !list[key].connected) {
				continue;
			}

			cb(list[key], key, list);
		}

		return list;
	},

	/*
	 * Emit to every connected
	 * peer in the list.
	 **/
	broadcast: function () {
		var args = Array.prototype.slice.call(arguments);
		this.each(function (client) {
			client.emit.apply(client, args);
		});
		return this;
	},

	/*
	 * Return the number of
	 * connected clients.
	 **/
	get length() {
		var count = 0;
		this.each(function () {
			count += 1;
		});
		return count;
	},

	set length(value) {
		throw new Error('Cannot set ClientList length.');
	}
};

assign(ClientList.prototype, Emitter.prototype);

module.exports = ClientList;
