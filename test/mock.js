'use strict';
var Emitter = require('events');
var Client = require('../src/Client');

/**
 * Creates a client wrapping a new fake websocket.
 * @param  {Object} [platform] - A platform.js-style object.
 * @return {Client} - Draws from a fake socket instance.
 */
function mock (platform) {
  var rand = Math.random();

  // Fake a socket.io socket.
  var socket = new Emitter();
  socket.connected = true;
  socket.id = rand.toString(36).slice(2);

  return new Client({
    socket: socket,
    platform: platform || {},
  });
}

module.exports = {
  Client: mock,
};
