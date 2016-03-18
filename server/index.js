/*jslint node: true*/
'use strict';

var Emitter = require('events');
var assign = require('object-assign-deep');
var io = require('socket.io');
var server;


function subscribe(socket) {
	socket.on('connection', function (client) {
		server.emit('join', client);
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
	}
	return socket;
}

server = module.exports = new Emitter();
assign(module.exports, {
	sockets: {},
	port: null,
	open: open,
	close: close
});
