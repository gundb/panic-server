/*jslint node: true, nomen: true*/
'use strict';

var express = require('express');
var server = express();

var port = process.argv[2] || 8080;
var host = 'localhost';

var path = require('path');
var dist = path.join(__dirname, '../dist');
var parser = require('body-parser').text();

module.exports = {
	setup: function (req, res) {
		res.status(200).json('No tests running');
	},

	root: express['static'](dist),
	progress: function (req, res) {
		res.status(200).json('Recieved');
	},
	done: function (req, res) {
		res.status(200).json('Recieved');
	},

	port: port,

	router: server,

	host: host,

	// return the full URL
	toString: function () {
		return 'http://' + host + ':' + port + '/';
	}
};

// wrap the middleware to allow dynamic routing
server.use(parser);

server.use(function (req, res, next) {
	module.exports.root.apply(this, arguments);
});

server.get('/setup', function (req, res) {
	module.exports.setup.apply(this, arguments);
});

server.post('/progress', function (req, res) {
	module.exports.progress.apply(this, arguments);
});

server.post('/done', function (req, res) {
	module.exports.done.apply(this, arguments);
});

server.listen(port, host);
