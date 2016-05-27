/*eslint-disable no-sync*/
'use strict';

var io = require('socket.io');
var fs = require('fs');
var clients = require('./clients');
var file = require.resolve('panic-client/panic.js');
var Server = require('http').Server;
var panic = require('./index');
var client;

Object.defineProperty(panic, 'client', {
	get: function () {
		if (!client) {
			client = fs.readFileSync(file, 'utf8');
		}
		return client;
	}
});

function serve(req, res) {
	if (req.url === '/panic.js') {
		res.end(panic.client);
	}
}

function upgrade(socket) {
	socket.on('handshake', function (platform) {
		clients.add({
			socket: socket,
			platform: platform
		});
	});
}

function open(server) {

	if (!(server instanceof Server)) {
		server = new Server();
	}

	server.on('request', serve);
	io(server).on('connection', upgrade);

	return server;
}

module.exports = open;
