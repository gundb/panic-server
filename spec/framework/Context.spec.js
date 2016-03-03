/*global jasmine, describe, it, expect*/
/*jslint node: true*/
'use strict';

var Context = require('../../lib/framework/Context');

describe('The Context constructor', function () {
	var chain = Context.prototype;

	it('should be a function', function () {
		expect(Context).toEqual(jasmine.any(Function));
	});

	it('should have a "client" method', function () {
		expect(chain.client).toEqual(jasmine.any(Function));
	});

	it('should have a "server" method', function () {
		expect(chain.server).toEqual(jasmine.any(Function));
	});

	it('should have a "config" property', function () {
		var ctx = new Context();
		expect(ctx.config).toEqual(jasmine.any(Object));
	});
});
