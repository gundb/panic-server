'use strict';
var io = require('socket.io');
var fs = require('fs');
var clients = require('./clients');
var file = require.resolve('../../panic-client/panic.js');

var server = require('http').createServer(function (req, res) {
	if (req.url === '/panic.js' || req.url === '/') {
		fs.createReadStream(file).pipe(res);
	}
});

function open(config) {
	config = config || {};
	config.port = config.port || 8080;
	config.hostname = config.hostname || 'localhost';

	server.listen(config.port, config.hostname);

	io(server).on('connection', function (socket) {
		socket.on('handshake', function (platform) {
			clients.add({
				socket: socket,
				platform: platform
			});
		});
	});
	return config;
}

module.exports = open;
