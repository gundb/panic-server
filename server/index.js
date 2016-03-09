/*jslint node: true, nomen: true*/
'use strict';

var server = require('http').createServer();

var port = process.argv[2] || 8080;
var host = process.argv[3] || 'localhost';

module.exports = {

	port: port,
	host: host,

	// return the full URL
	toString: function () {
		return 'http://' + host + ':' + port + '/';
	}
};

server.listen(port, host);
