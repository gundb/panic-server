/*jslint node: true*/
'use strict';

var Emitter = require('events');
var assign = require('object-assign-deep');
var io = require('socket.io');
var server;

function subscribe(socket) {
	socket.on('connection', function (client) {

		client.on('disconnect', function () {
			delete server.clients[client.PANIC_ID];
			server.emit('disconnect', client);
		});

		client.on('ID', function (ID) {
			client.PANIC_ID = ID;
			server.clients[ID] = client;
			server.emit('connection', client);
		});

		client.on('ready', function (testID) {
			server.emit('ready', testID, client);
		});

		client.on('done', function (meta) {
			server.emit('done', meta);
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
	clients: {},
	port: null,
	open: open,
	close: close
});

server.on('run', function (ID) {
	console.log('Running:', ID);
	Object.keys(server.clients).forEach(function (key) {
		var client = server.clients[key];
		client.emit('run', ID);
	});
});
