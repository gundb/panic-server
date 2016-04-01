/*jslint node: true*/
/*global Gun, test, expect*/

'use strict';
var Test = require('./framework/Test');
var server = require('../server');
var stack = require('../src/framework/stack');

global.test = Test;
module.exports = {
	test: Test,
	server: server,
	stack: stack
};
