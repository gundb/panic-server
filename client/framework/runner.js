/*jslint node: true*/
'use strict';

var Context = require('./Context');

module.exports = function (test) {
	var ctx = new Context(test);
	test.cb.call(ctx, ctx, ctx.done);
};
