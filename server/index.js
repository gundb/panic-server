/*jslint node: true*/
'use strict';

var Emitter = require('events');
var io = require('socket.io');
var List = require('../src/framework/ClientList');
var server;

var clients = new List();

function subscribe(socket) {
	socket.on('connection', function (client) {

		client.on('details', function (ID, platform) {
			client.platform = platform;
			client.PANIC_ID = ID;
			client.setMaxListeners(Infinity);
			clients.add(client);
		});

		client.on('ready', function (testID) {
			server.emit('ready', testID, client);
		});

		client.on('event', server.emit.bind(server));
	});
}

function open(port) {

	// set default port
	port = port || 8080;

	// don't try to re-open
	if (server.socket) {
		return server.socket;
	}

	// update state
	var socket = io(port);
	server.socket = socket;

	subscribe(socket);
	return socket;
}

function close(port) {
	var socket = server.socket;
	if (server.socket) {
		socket.close();
		server.socket = null;
	}
	return socket;
}

// Merge server with event emitter
server = module.exports = new Emitter();
server.setMaxListeners(Infinity);
server.socket = null;
server.port = null;
server.open = open;
server.close = close;
server.clients = clients;
