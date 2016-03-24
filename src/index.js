/*jslint node: true*/
/*global Gun, test*/

'use strict';
var Test = require('./framework/Test');
var server = require('../server');

global.test = Test;
module.exports = Test;

test('Panic client', function () {
	this.env({
		working: true
	});

	this.use(function () {
		var thing = {};
		this.env.thing = thing;
		thing.thing = thing;
	});

	this.client(function (ctx) {
		console.log(this.env.thing);
		if (location.hash === '#wait') {
			this.done();
		} else {
			setTimeout(this.done.bind(this), 5000);
		}
	});

	this.peers(1);
});

test(function () {

	this.client(function () {
		console.log('WOOOOOOT!');
		this.done();
	});

	this.peers(1);
});

server.open(8080);
