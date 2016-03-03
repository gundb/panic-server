/*jslint node: true, nomen: true*/
'use strict';

var route = require('./index');

function bump(ctx) {
	route.setup = function (req, res) {
		res.status(200).json(ctx);
	};
}

module.exports = bump;
