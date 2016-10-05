/*globals beforeEach, describe, it*/
'use strict';
var mock = require('./mock');
var Client = mock.Client;
var ClientList = require('../src/ClientList');
var Promise = require('bluebird');

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
		expect(list.length).to.eq(1);
		list.remove(client);
		expect(list.length).to.eq(0);
	});

	it('should not add disconnected clients', function () {
		client.socket.connected = false;
		list.add(client);
		expect(list.length).to.eq(0);
	});

	it('should remove a client on disconnect', function () {
		list.add(client);
		expect(list.length).to.eq(1);
		client.socket.emit('disconnect');
		expect(list.length).to.eq(0);
	});

	it('should resolve when all clients finish', function (done) {
		var socket = client.socket;
		socket.on('run', function (cb, jobID) {
			socket.emit(jobID);
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
			expect(list.length).to.eq(1);
			list.filter(function () {
				return false;
			});
			expect(list.length).to.eq(1);
		});

		it('should return a new, filtered list', function () {
			list.add(client);
			var servers = list.filter('Node.js');
			var browsers = list.filter(function (client) {
				return client.platform.name !== 'Node.js';
			});
			expect(servers.length).to.eq(1);
			expect(browsers.length).to.eq(0);
		});

		it('should be reactive to changes to the parent list', function () {
			var servers = list.filter('Node.js');
			expect(servers.length).to.eq(0);
			list.add(client);
			expect(servers.length).to.eq(1);
		});
	});

	describe('exclusion', function () {
		it('should not contain excluded clients', function () {
			list.add(client);
			var filtered = list.excluding(list);
			expect(filtered.length).to.eq(0);
		});

		it('should react to removals if they are connected', function () {
			var decoy = new Client();
			var exclusion = new ClientList()
			.add(client)
			.add(decoy);
			var filtered = list.excluding(exclusion);
			list.add(client).add(new Client());
			expect(filtered.length).to.eq(1);
			exclusion.remove(client).remove(decoy);
			expect(filtered.length).to.eq(2);
		});
	});

	describe('number constraint', function () {
		it('should return no more than the number requested', function () {
			list.add(client)
			.add(new Client())
			.add(new Client());
			expect(list.pluck(1).length).to.eq(1);
		});

		it('should listen for additions', function () {
			var subset = list.pluck(2);
			expect(subset.length).not.to.eq(2);
			list.add(new Client()).add(new Client());
			expect(subset.length).to.eq(2);
			list.add(new Client());
			expect(subset.length).to.eq(2);
		});

		it('should replace a client when it disconnects', function () {
			var subset = list.pluck(1);
			list.add(client).add(new Client());
			expect(subset.length).to.eq(1);
			client.socket.emit('disconnect');
			// It should be replaced with
			// the second connected client.
			expect(subset.length).to.eq(1);
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
			expect(alice.length).to.eq(1);
			expect(bob.length).to.eq(1);
		});
	});

	describe('minimum qualifier', function () {

		it('should resolve when the minimum is reached', function () {
			var promise = list.atLeast(1);
			var called = false;
			promise.then(function () {
				called = true;
			});
			expect(called).to.eq(false);
			list.add(new Client());

			// Mocha will wait for this to resolve.
			return promise;
		});

		it('should resolve if the min is already reached', function () {
			var promise = list.atLeast(0);

			// This will time out if unresolved.
			return promise;
		});

		it('should resolve to undefined', function () {
			function validate (arg) {
				expect(arg).to.eq(undefined);
			}
			var immediate = list.atLeast(0).then(validate);
			var later = list.atLeast(1).then(validate);

			list.add(new Client());

			return Promise.all([immediate, later]);
		});

		it('should resolve if it has more than enough', function () {
			list.add(new Client()).add(new Client());

			return list.atLeast(1);
		});

		it('should unsubscribe after resolving', function () {
			list.atLeast(1);
			expect(list.listenerCount('add')).to.eq(1);
			list.add(new Client());
			expect(list.listenerCount('add')).to.eq(0);
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

	it('should be subclassable', function () {
		function Sub() {
			ClientList.call(this);
		}
		Sub.prototype = new ClientList();
		Sub.prototype.constructor = Sub;

		var sub = new Sub();
		expect(sub).to.be.an.instanceof(Sub);

		// chained inheritance
		expect(sub.filter('Firefox')).to.be.an.instanceof(Sub);
		expect(sub.pluck(1)).to.be.an.instanceof(Sub);
	});
});
