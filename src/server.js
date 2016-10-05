/*eslint-disable no-sync*/
'use strict';

var io = require('socket.io');
var fs = require('fs');
var clients = require('./clients');
var file = require.resolve('panic-client/panic.js');
var Server = require('http').Server;
var panic = require('./index');
var Client = require('./Client');
var client;

/**
 * Lazy getter for the panic-client bundle.
 * @returns {String} - The whole webpacked client bundle.
 */
Object.defineProperty(panic, 'client', {
	get: function () {
		if (!client) {
			client = fs.readFileSync(file, 'utf8');
		}

		return client;
	}
});

/**
 * Filter requests for /panic.js and send
 * the bundle.js file.
 * @param  {Object} req - http request object.
 * @param  {Object} res - http response object.
 * @return {undefined}
 */
function serve(req, res) {
	if (req.url === '/panic.js') {
		res.end(panic.client);
	}
}

/**
 * Listen for a panic handshake,
 * only then adding it to the panic.clients list.
 * @param  {Socket} socket - A socket.io websocket.
 * @return {undefined}
 */
function upgrade(socket) {
	socket.on('handshake', function (platform) {

		/** Create a new panic client. */
		var client = new Client({
			socket: socket,
			platform: platform,
		});

		/** Add the new client. */
		clients.add(client);

	});
}

/**
 * Attach to a server, handling incoming panic traffic.
 * @param  {Server} [server]
 * An http server instance.
 * If none is provided, a server will be created.
 * @return {Server} - Either the server passed, or a new server.
 */
function open(server) {

	if (!(server instanceof Server)) {
		server = new Server();
	}

	/** Handle /panic.js route. */
	server.on('request', serve);

	/** Upgrade with socket.io */
	io(server).on('connection', upgrade);

	return server;
}

module.exports = open;
