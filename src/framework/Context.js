/*jslint node: true*/
'use strict';

var Response = require('../configuration/Response');

function Context(test, config) {
	this.test = test;
	this.config = new Response(config);
}

Context.prototype = {
	constructor: Context,

	server: function (cb, args) {
		this.config.cbs.push({
			conditional: 'typeof global !== "undefined"',
			cb: cb
		});
		return this;
	},

	client: function (cb, args) {
		this.config.cbs.push({
			args: args,
			conditional: "typeof window !== 'undefined'",
			cb: cb
		});
	}
};

module.exports = Context;
