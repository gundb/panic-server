/*jslint node: true*/
'use strict';

var Emitter = require('events');
var assign = require('object-assign-deep');
var io = require('socket.io');
var server;

function subscribe(socket) {
	socket.on('connection', function (client) {

		server.emit('connection', client);

		client.on('disconnect', function () {
			server.emit('disconnect', client);
		});

		client.on('ready', function (ready) {
			server.emit('ready', ready, client);
		});
	});
}

function open(port) {

	// set default port
	port = port || 8080;

	// don't try to re-open
	if (server.sockets[port]) {
		return server.sockets[port];
	}

	// update state
	var socket = io(port);
	server.sockets[port] = socket;

	subscribe(socket);
	return socket;
}

function close(port) {
	var socket = server.sockets[port];
	if (socket) {
		socket.close();
		delete server.sockets[port];
	}
	return socket;
}

module.exports = new Emitter();
assign(server = module.exports, {
	sockets: {},
	port: null,
	open: open,
	close: close
});
