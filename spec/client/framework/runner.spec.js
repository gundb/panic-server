/*globals jasmine, describe, it, expect*/
/*jslint node: true*/
'use strict';

var runner = require('../../../client/framework/runner');
var Context = require('../../../client/framework/Context');

function run(prop, val) {
	if (!val) {
		val = prop;
		prop = 'cb';
	}
	var obj = {};
	obj[prop] = val;
	return runner(obj);
}

describe('The client test runner', function () {
	it('should be a function', function () {
		expect(runner).toEqual(jasmine.any(Function));
	});

	it('should take a test descriptor and invoke the cb', function (done) {
		run(done);
	});

	it('should expose the "env" in the "this" context', function () {
		runner({
			env: { success: true },
			cb: function () {
				expect(this.env.success).toBe(true);
			}
		});
	});

	it('should use a context instance as the "this" value', function () {
		run(function () {
			expect(this).toEqual(jasmine.any(Context));
		});
	});

	it('should send the context as the first cb param', function () {
		run(function (ctx) {
			expect(ctx).toEqual(jasmine.any(Context));
		});
	});

	it('should pass the "done" function in as the second param', function () {
		run(function (ctx, done) {
			expect(done).toEqual(jasmine.any(Function));
		});
	});
});
