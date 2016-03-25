#!/usr/bin/env node
/*jslint node: true*/
'use strict';

var panic = require('../index');
var stack = require('../framework/stack');
var server = require('../../server');
var glob = require('glob');
var fs = require('fs');
var dir = process.cwd();
var path = require('path');
var port = process.argv[2] || 8080;

var file = path.join(dir, 'test', 'panic.config.js');

var config = require(file);

config.tests = config.tests || path.join('tests', '*.panic.js');

glob(path.join(dir, config.tests), function (err, list) {
	list.forEach(function (test) {
		require(test);
	});
	if (stack.current) {
		server.open(process.argv[2]);
		console.log('Beginning on port:', port);
		stack.on('finished', function () {
			process.exit(0);
		});
	}
});
