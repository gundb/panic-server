/*global jasmine, describe, it, expect, beforeEach*/
/*jslint node: true*/
'use strict';

var Context = require('../../src/framework/Context');

describe('The Context constructor', function () {
	var ctx, proto = Context.prototype;

	beforeEach(function () {
		ctx = new Context();
	});

	it('should be a function', function () {
		expect(Context).toEqual(jasmine.any(Function));
	});

	it('should have a "server" method', function () {
		expect(proto.server).toEqual(jasmine.any(Function));
	});

	it('should have a "config" property', function () {
		expect(ctx.config).toEqual(jasmine.any(Object));
	});

	it('should have a "cbs" array in the config', function () {
		expect(ctx.config.cbs).toEqual(jasmine.any(Array));
	});

	describe('"client" method', function () {
		var cbs;
		beforeEach(function () {
			ctx.client(function () {});
			cbs = ctx.config.cbs;
		});
		it('should be a function', function () {
			expect(proto.client).toEqual(jasmine.any(Function));
		});

		it('should push to the "cbs" array', function () {
			expect(cbs.length).toBe(1);
		});

		it('should create a test descriptor', function () {
			expect(cbs[0]).toEqual(jasmine.any(Object));
		});

		it('should create a test conditional', function () {
			expect(cbs[0].conditional).toBeTruthy();
		});
	});

	describe('"server" method', function () {
		var cbs;
		beforeEach(function () {
			ctx.server(function () {});
			cbs = ctx.config.cbs;
		});

		it('should be a function', function () {
			expect(ctx.server).toEqual(jasmine.any(Function));
		});

		it('should push to the "cbs" array', function () {
			expect(cbs[0]).toEqual(jasmine.any(Object));
		});

		it('should create a test conditional', function () {
			expect(cbs[0].conditional).toEqual(jasmine.any(String));
		});
	});
});
