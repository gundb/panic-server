/*jslint node: true*/

'use strict';
var Test = require('./framework/Test');
var server = require('../server');

global.test = Test;
module.exports = Test;

global.test('Panic client', function () {
	this.env({
		msg: "You are"
	});

	this.env({
		status: 'amazing'
	});

	this.client(function () {
		console.log("We're online!");
	});
});

server.open(8080);
