/*jslint node: true*/
'use strict';

// deeply merge objects
var assign = require('object-assign-deep');
var defaults = require('./defaults');

/*
	This is the test configuration constructor.
	An instance is created each time a new
	`test()` is declared, and is later configured
	dynamically through the test.
*/
function Response(obj) {

	// provide defaults
	assign(this, defaults);

	// overwrite the defaults
	assign(this, obj);
}

module.exports = Response;
