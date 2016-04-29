'use strict';
var Emitter = require('events');

function Client(platform) {
	this.socket = new Emitter();
	this.socket.connected = true;
	this.socket.id = Math.random()
	.toString(36)
	.slice(2);
	this.platform = platform || {};
}

module.exports = {
	Client: Client
};
