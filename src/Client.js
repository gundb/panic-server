'use strict';

var Promise = require('bluebird');

/**
 * A wrapper around a websocket, providing
 * methods for interacting with clients.
 * @throws {Error} - The socket and platform must be valid.
 * @param {Object} client - A panic-client handshake.
 * @param {Socket} client.socket - The socket.io connection.
 * @param {Object} client.platform - The client platform.js object.
 * @class Client
 */
function Client (client) {

	/** Basic input validation. */
	if (!client.socket) {
		throw new Error('Invalid "client.socket" property.');
	}
	if (!client.platform) {
		throw new Error('Invalid "client.platform" property.');
	}

	this.socket = client.socket;
	this.platform = client.platform;
}

Client.prototype = {
	constructor: Client,

	/**
	 * Sends a function to be run on the client.
	 * @param  {Function} job - A function to be run remotely.
	 * The function will be stringified, so it cannot depend on
	 * external "local" variables, including other functions.
	 * @param  {Object} [props] - Any variables used in the job.
	 * @return {Promise} - Resolves if the job finishes,
	 * rejects if it throws an error.
	 */
	run: function (job, props) {
		if (typeof job !== 'function') {
			throw new TypeError(
				'Expected job "' + job + '" to be a function.'
			);
		}

		var source = String(job);
		var jobID = Math.random()
			.toString(36)
			.slice(2);

		var socket = this.socket;

		/** Report the success or failure of the job. */
		var promise = new Promise(function (resolve, reject) {
			socket.once('disconnect', resolve);

			socket.once(jobID, function (error) {
				socket.removeListener('disconnect', resolve);

				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});

		socket.emit('run', source, jobID, props);

		return promise;
	},
};

module.exports = Client;
