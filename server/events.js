/*jslint node: true*/

/*
	Used to notify reporters and
	the test stack when "done",
	"progress", "fail" and "pass"
	events happen.
*/

var Emitter = require('events');
module.exports = new Emitter();
