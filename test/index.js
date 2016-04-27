/*globals beforeEach, describe, it*/
'use strict';
var mock = require('./mock');
var Client = mock.Client;
var ClientList = require('../src/ClientList');

var expect = require('chai').expect;

describe('A clientList', function () {
	var list, client;
	beforeEach(function () {
		list = new ClientList();
		client = new Client({
			name: 'Node.js'
		});
	});

	it('should emit when a client is added', function () {
		var fired = false;
		list.on('add', function () {
			fired = true;
		}).add(client);
		expect(fired).to.eq(true);
	});

	it('should emit when a client is removed', function () {
		var fired = false;
		list.on('remove', function () {
			fired = true;
		})
		.add(client)
		.remove(client);
		expect(fired).to.eq(true);
	});

	it('should return length when "len()" is called', function () {
		list.add(client);
		expect(list.len()).to.eq(1);
		list.remove(client);
		expect(list.len()).to.eq(0);
	});

	it('should not add disconnected clients', function () {
		client.socket.connected = false;
		list.add(client);
		expect(list.len()).to.eq(0);
	});

	it('should remove a client on disconnect', function () {
		list.add(client);
		expect(list.len()).to.eq(1);
		client.socket.emit('disconnect');
		expect(list.len()).to.eq(0);
	});

	describe('filter', function () {
		it('should not mutate the original list', function () {
			list.add(client);
			expect(list.len()).to.eq(1);
			list.filter(function () {
				return false;
			});
			expect(list.len()).to.eq(1);
		});

		it('should return a new, filtered list', function () {
			list.add(client);
			var servers = list.filter('Node.js');
			var browsers = list.filter(function (client) {
				return client.platform.name !== 'Node.js';
			});
			expect(servers.len()).to.eq(1);
			expect(browsers.len()).to.eq(0);
		});

		it('should be reactive to changes to the parent list', function () {
			var servers = list.filter('Node.js');
			expect(servers.len()).to.eq(0);
			list.add(client);
			expect(servers.len()).to.eq(1);
		});
	});

	describe('exclusion', function () {
		it('should not contain excluded clients', function () {
			list.add(client);
			var filtered = list.excluding(list);
			expect(filtered.len()).to.eq(0);
		});
	});

	it('should resolve a promise when all clients finish', function (done) {
		client.socket.on('run', function (cb, jobID) {
			client.socket.emit(jobID);
		});
		list.add(client).run(function () {})
		.then(function () {
			done();
		})
		.catch(done);
	});

	it('should reject a promise if an error is sent', function (done) {
		client.socket.on('run', function (cb, job) {
			client.socket.emit(job, 'fake error');
		});
		list.add(client).run(function () {})
		.catch(function (err) {
			expect(err).to.eq('fake error');
			done();
		});
	});
});
