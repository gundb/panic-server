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

	this.client(function (ctx) {
		console.log('Working:', this.env.working);
		setTimeout(this.done, 5000);
	});

	this.peers(1);
});

test(function () {

	this.client(function () {
		setTimeout(this.done, 3000);
	});

	this.peers(1);
});

server.open(8080);
