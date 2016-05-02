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

	it('should not emit "add" if it contains the client', function () {
		var called = 0;
		list.on('add', function () {
			called += 1;
		});
		list.add(client);
		list.add(client);
		expect(called).to.eq(1);
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

		it('should react to removals if they are connected', function () {
			var decoy = new Client();
			var exclusion = new ClientList()
			.add(client)
			.add(decoy);
			var filtered = list.excluding(exclusion);
			list.add(client).add(new Client());
			expect(filtered.len()).to.eq(1);
			exclusion.remove(client).remove(decoy);
			expect(filtered.len()).to.eq(2);
		});
	});

	describe('number constraint', function () {
		it('should return no more than the number requested', function () {
			list.add(client)
			.add(new Client())
			.add(new Client());
			expect(list.pluck(1).len()).to.eq(1);
		});

		it('should listen for additions', function () {
			var subset = list.pluck(2);
			expect(subset.len()).not.to.eq(2);
			list.add(new Client()).add(new Client());
			expect(subset.len()).to.eq(2);
			list.add(new Client());
			expect(subset.len()).to.eq(2);
		});

		it('should replace a client when it disconnects', function () {
			var subset = list.pluck(1);
			list.add(client).add(new Client());
			expect(subset.len()).to.eq(1);
			client.socket.emit('disconnect');
			// It should be replaced with
			// the second connected client.
			expect(subset.len()).to.eq(1);
		});

		it('should set a flag whether the constraint is met', function () {
			var subset = list.pluck(1);
			expect(subset.atCapacity).to.eq(false);
			list.add(client);
			expect(subset.atCapacity).to.eq(true);
			client.socket.emit('disconnect');
			expect(subset.atCapacity).to.eq(false);
		});

		it('should play well with exclusions', function () {
			var bob, alice = list.pluck(1);
			bob = list.excluding(alice).pluck(1);
			list.add(client)
			.add(new Client())
			.add(new Client());
			expect(alice.len()).to.eq(1);
			expect(bob.len()).to.eq(1);
		});
	});
});

describe('The ClientList constructor', function () {
	var list1, list2, client1, client2;

	beforeEach(function () {
		list1 = new ClientList();
		list2 = new ClientList();
		client1 = new Client();
		client2 = new Client();
		list1.add(client1);
		list2.add(client2);
	});

	it('should accept an array of clientLists', function () {
		var list = new ClientList([list1, list2]);

		// it should contain both clients
		expect(list.get(client1.socket.id)).to.eq(client1);
		expect(list.get(client2.socket.id)).to.eq(client2);
	});

	it('should reactively add new clients from source lists', function () {
		var list = new ClientList([list1, list2]);
		var client3 = new Client();
		expect(list.get(client3.socket.id)).to.eq(null);
		list1.add(client3);
		expect(list.get(client3.socket.id)).to.eq(client3);
	});
});
