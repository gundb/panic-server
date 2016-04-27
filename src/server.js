var io = require('socket.io');
var fs = require('fs');
var clients = require('./clients');

var server = require('http').createServer(function (req, res) {
	if (req.url !== '/panic.js' && req.url !== '/') {
		return;
	}
	var path = require.resolve('../../panic-client/panic.js');
	fs.createReadStream(path).pipe(res);
});

function open(config) {
	config = config || {};
	config.port = config.port || 8080;
	config.hostname = config.hostname || 'localhost';

	server.listen(config.port, config.hostname);

	io(server).on('connection', function (client) {
		client.on('handshake', function (platform) {
			clients.add({
				socket: client,
				platform: platform
			});
		});
	});
	return config;
}

module.exports = open;
