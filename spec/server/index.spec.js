/*globals jasmine, describe, it, expect*/
/*jslint node: true*/
'use strict';

// override port default
process.argv[2] = 3000;

var server = require('../../server');
var Emitter = require('events');
var Socket = require('socket.io');
var io = require('socket.io-client');

describe('The socket server', function () {
	it('should have an event emitter', function () {
		expect(server.events).toEqual(jasmine.any(Emitter));
	});

	describe('open method', function () {
		it('should be a function', function () {
			expect(server.open).toEqual(jasmine.any(Function));
		});

		it('should open a new socket', function () {
			server.open(8080);
			expect(server.socket).toEqual(jasmine.any(Socket));
		});

		it('should close the old socket', function () {
			// same port, shouldn't throw EADDRINUSE
			server.open(8080);
			server.open(8080);
		});

		it('should return the new socket', function () {
			var result = server.open(8080);
			expect(server.socket).toBe(result);
		});

		it('should update the port number', function () {
			server.open(1234);
			expect(server.port).toBe(1234);
		});

		it('should default the port to 8080', function () {
			server.open();
			expect(server.port).toBe(8080);
		});
	});

	it('should expose the socket server', function () {
		expect(server.hasOwnProperty('socket')).toBe(true);
	});

	it('should expose the port number', function () {
		expect(server.hasOwnProperty('port')).toBe(true);
	});

	it('should notify when clients join', function (done) {
		server.open(8080);
		server.events.on('join', done);
		io('http://localhost:8080');
	});

	it('should pass the client obj on join', function (done) {
		server.open(8080);
		server.events.on('join', function (client) {
			expect(client).toEqual(jasmine.any(Object));
			done();
		});
		io('http://localhost:8080');
	});
});
