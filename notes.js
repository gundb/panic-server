/*global test, Gun*/

test('Server push', function () {
	'use strict';
	var times = 50;

	this.peer('server', function (server) {
		var gun = new Gun('http://localhost:8080');

		server.times(times, function (i, last, done) {
			return gun.get('push').path(i).put('hey', done);
		});
	});

	this.peer('server', function (server, done) {
		server.timeout(10000);
		var gun, num = 0;
		gun = new Gun().get('push');
		gun.map().val(function () {
			num += 1;
			done.when(num === times);
		});
	});
});

test('Client sync', function () {
	'use strict';

	var list = [
		'test',
		'potato',
		'no',
		'bar'
	];

	this.use(function () {
		// universal selector?
	});

	this.peer('firefox', function () {
		var gun = new Gun(location + 'gun');
		this.times(list, function (name) {
			gun.get(name).put({
				name: name
			});
		});
	});

	this.peer('chrome', function (peer, done) {
		var gun = new Gun(location + 'gun');
		this.times(list, function (name) {
			gun.get(name).path('name').val(function (val) {

			});
		});
	});

	this.use(function () {
		this.env = new Gun(location + 'gun').get('potato');
	});

	this.browser(function () {
		this.env.val(); // #potato
	});

	this.server(function () {
		this.env.val(); // #potato
	});

	// "done" from runner env
	this.chrome(function (browser, done) {
		done.when(window.potato === 5);
	});


	// vote against argument injectors
	this.firefox(function (five, ten) {
		var expression = true;
		this.finished();
		this.finished.when(expression);
	}, [5, 10]);

	this.firefox(function (browser, done) {
		//this.env.value == true
		//this.env.data == "string"
		browser.env.data = "string"; // yep
	}, {
		value: true,
		data: "string"
	});

});







test('Server push', function () {
	'use strict';
	var responses = 0;
	this.ready(function (res) {
		responses += 1;
		return responses === 5;
	});

	this.all(function () {
		this.env.gun = new Gun('localhost:8080/gun');
	});

	this.fail('Reason');

	this.browser(function () {
		this.times(20, function (val) {
			return gun.path(val).put({
				data: true
			});
		});
	});

	this.server(function () {
		this.env.gun
	});


});


var Context = require('./lib/framework/context');

// if the test succeeds
Context.prototype.success = function () {
	var test, total = {};
	test = this;
	this.done(function (done) {
		total[done.peer] = done.status;
		var keys = Object.keys(total);
		if (test.peers === keys.length) {
			var success = !Object.values(total).find(function (win) {
				return !win;
			});
		}
	});
};


