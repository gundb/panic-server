/*global jasmine, describe, it, expect, beforeEach*/
/*jslint node: true*/
'use strict';


// should import test
var test = require('../../src');
var Emitter = require('events');
var stack = require('../../src/framework/stack');

describe('The test function', function () {
	it('should be a function', function () {
		expect(global.test).toEqual(jasmine.any(Function));
		expect(test).toEqual(jasmine.any(Function));
	});

	it('should take a function and invoke it', function (done) {
		test(done);
	});

	it('should assign an ID to each test', function () {
		var result = test(function () {});
		expect(result.ID).toEqual(jasmine.any(String));
	});

	it('should provide unique IDs', function () {
		var ID2, ID1;
		ID1 = test(function () {}).ID;
		ID2 = test(function () {}).ID;
		expect(ID1).not.toBe(ID2);
	});

	it('should expose the connected runners', function () {
		var runners = test(function () {}).runners;
		expect(runners).toEqual(jasmine.any(Object));
	});

	it('should inherit from EventEmitter', function () {
		var instance = test(function () {});
		expect(instance).toEqual(jasmine.any(Emitter));
	});

	it('should invoke with a new test context', function () {
		test(function () {
			expect(this).toEqual(jasmine.any(test));
		});
	});

	it('should allow you to name tests', function (done) {
		test('Named test', done);
	});

	it('should pass the context as arg0', function () {
		test(function (ctx) {
			expect(ctx).toEqual(jasmine.any(test));
		});
	});

	it('should name tests without a name "Anonymous"', function () {
		var result = test(function () {});
		expect(result.description).toBe('Anonymous');
	});

	it('should remember the test name', function () {
		var result = test('fabulous success', function () {});
		expect(result.description).toBe('fabulous success');
	});

	it('should push the test onto the stack', function () {
		stack.next = [];
		stack.current = {};
		test(function () {});
		expect(stack.next.length).toBe(1);
	});
});


describe('The Context constructor', function () {
	var ctx, proto = test.prototype;

	beforeEach(function () {
		ctx = test(function () {});
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
