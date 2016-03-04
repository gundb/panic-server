/*globals jasmine, describe, it, expect*/
/*jslint node: true*/
'use strict';

var runner = require('../../../client/framework/runner');

describe('The client test runner', function () {
	it('should be a function', function () {
		expect(runner).toEqual(jasmine.any(Function));
	});
});
