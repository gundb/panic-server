/*jslint node: true*/
'use strict';

var Emitter = require('events');
var io = require('socket.io');
var List = require('../src/framework/ClientList');
var server;

var clients = new List();

function subscribe(socket) {
	socket.on('connection', function (client) {

		client.on('ID', function (ID) {
			client.PANIC_ID = ID;
			clients.add(client);
			server.emit('connection', client);
		});

		client.on('ready', function (testID) {
			server.emit('ready', testID, client);
		});

		client.on('event', server.emit.bind(server));

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

// Merge server with event emitter
server = module.exports = new Emitter();
server.sockets = {};
server.port = null;
server.open = open;
server.close = close;
server.clients = clients;


server.on('run', function (ID) {
	console.log('Running:', ID);
	clients.each(function (client) {
		client.emit('run', ID);
	});
});
