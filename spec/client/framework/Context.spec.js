/*globals jasmine, describe, it, expect*/
/*jslint node: true*/
'use strict';

var Context = require('../../../client/framework/Context');

describe('The client context constructor', function () {
	it('should be a function', function () {
		expect(Context).toEqual(jasmine.any(Function));
	});

	it('should always create an "env" property', function () {
		var context = new Context();
		expect(context.env).toEqual(jasmine.any(Object));
	});

	it('should list "Context" as the constructor', function () {
		expect(Context.prototype.constructor).toBe(Context);
	});

	it('should merge the "env" property with arg0', function () {
		var context = new Context({
			env: { success: true }
		});
		expect(context.env.success).toBe(true);
	});

	it('should have a "done" method', function () {
		var context = new Context();
		expect(context.done).toEqual(jasmine.any(Function));
	});

	it('should have a default timeout', function () {
		var timeout = Context.prototype.timeout;
		expect(timeout).toEqual(jasmine.any(Number));
	});

	it('should watch for a timeout property', function () {
		var context = new Context({
			timeout: 42
		});
		expect(context.timeout).toBe(42);
	});

	it('should validate timeouts', function () {
		var context = new Context({
			timeout: 'invalid'
		});
		expect(context.timeout).toEqual(jasmine.any(Number));
	});

	it('should protect against null test inputs', function () {
		expect(function () {
			return new Context(null);
		}).not.toThrow();
	});
});
