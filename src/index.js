/*jslint node: true*/

'use strict';
var Test = require('./framework/Test');
var server = require('../server');

global.test = Test;
module.exports = Test;

global.test('Panic client', function () {
	this.env({
		working: true
	});

	this.client(function (ctx) {
		console.log('Working:', ctx.env.working);
	});
});

server.open(8080);
