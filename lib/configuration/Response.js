/*jslint node: true*/
'use strict';

// deeply merge objects
var assign = require('object-assign-deep');
var defaults = require('./defaults');

function Response(obj) {

	// provide defaults
	assign(this, defaults);

	// overwrite the defaults
	assign(this, obj);
}

module.exports = Response;
