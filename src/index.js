'use strict';
var server = require('./server');
var clients = require('./clients');

var msg = '\n\nAPI CHANGE: ".serve()" has been renamed to ".server()",\n' +
'and no longer works the same (see changelog#v0.2.0).\n';

module.exports = {
	server: server,
	serve: function () {
		throw new Error(msg);
	},
	clients: clients
};
