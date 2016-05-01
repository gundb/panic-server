'use strict';
var io = require('socket.io');
var fs = require('fs');
var clients = require('./clients');
var file = require.resolve('panic-client/panic.js');
var Server = require('http').Server;

function serve(req, res) {
	if (req.url === '/panic.js') {
		fs.createReadStream(file).pipe(res);
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
