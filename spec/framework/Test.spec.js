/*jslint node: true*/
/*global jasmine, describe, it, expect*/
'use strict';


// should import test
var test = require('../../lib');
var Context = require('../../lib/framework/Context');

describe('The test function', function () {
	it('should be a function', function () {
		expect(global.test).toEqual(jasmine.any(Function));
		expect(test).toEqual(jasmine.any(Function));
	});

	it('should take a function and invoke it', function (done) {
		test(done);
	});

	it('should invoke with a new test context', function () {
		test(function () {
			expect(this).toEqual(jasmine.any(Context));
		});
	});

	it('should allow you to name tests', function (done) {
		test('Named test', done);
	});

	it('should pass the context as arg1', function () {
		test(function (ctx) {
			expect(ctx).toEqual(jasmine.any(Context));
		});
	});
});
