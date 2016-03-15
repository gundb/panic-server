/*jslint node: true*/
'use strict';

var Emitter = require('events');

var io = require('socket.io');
var server;


function subscribe(socket) {
	socket.on('connection', function (client) {
		server.events.emit('join', client);
	});
}

function open(port) {

	// set default port
	port = port || 8080;

	// close old socket
	if (server.socket) {
		server.socket.close();
	}

	// update state
	server.port = port;
	server.socket = io(port);

	subscribe(server.socket);
	return server.socket;
}

module.exports = server = {
	events: new Emitter(),
	socket: null,
	port: null,
	open: open
};
