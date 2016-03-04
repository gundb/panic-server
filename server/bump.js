/*jslint node: true, nomen: true*/
'use strict';

var route = require('./index');
var event = require('./events');

function bump(ctx) {
	route.setup = function (req, res) {
		res.status(200).json(ctx);
	};
	event.emit('begin', ctx);
}

module.exports = bump;
