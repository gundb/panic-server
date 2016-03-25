/*global jasmine, describe, it, expect, beforeEach, spyOn*/
/*jslint node: true*/
'use strict';

var test = require('../../src/framework/Test');
var stack = require('../../src/framework/stack');

describe('The Test constructor', function () {
	it('should give a UID to each test', function () {
		var first, second;
		first = test(function () {});
		second = test(function () {});
		expect(first.ID).not.toBe(second.ID);
	});

	it('should give a description to each test', function () {
		var instance = test('success', function () {});
		expect(instance.description).toMatch(/success/);
	});

	it('should push tests to the stack', function () {
		spyOn(stack, 'push');
		var TDO = test(function () {});
		expect(stack.push).toHaveBeenCalledWith(TDO);
	});

	it('should allow JSONification', function () {
		var circular, TDO = test(function () {});
		circular = {};
		circular.ref = circular;
		TDO.circular = circular;
		JSON.stringify(TDO);
	});
});
