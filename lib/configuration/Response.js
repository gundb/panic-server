/*jslint node: true*/
'use strict';

// deeply merge objects
var assign = require('object-assign-deep');
var defaults = require('./defaults');
var Gun = require('gun/gun');

/*
	This is the test configuration constructor.
	An instance is created each time a new
	`test()` is declared, and is later configured
	dynamically by "Context.js".
*/
function Response(obj) {
	this.testID = Gun.text.random();

	// provide defaults
	assign(this, defaults);

	// overwrite the defaults
	assign(this, obj);
}

module.exports = Response;
