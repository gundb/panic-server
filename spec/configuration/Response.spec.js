/*global jasmine, describe, it, expect*/
/*jslint node: true*/
'use strict';

var Response = require('../../lib/configuration/Response');

describe('The Response constructor', function () {
	it('should be a function', function () {
		expect(Response).toEqual(jasmine.any(Function));
	});

	it('should return an object', function () {
		expect(new Response()).toEqual(jasmine.any(Object));
	});

	it('should merge the returned object with arg1', function () {
		var result = new Response({
			success: true
		});
		expect(result.success).toBe(true);
	});

	it('should merge with the default settings', function () {
		var keys = Object.keys(new Response());
		expect(keys.length).toBeGreaterThan(0);
	});

	it('should produce a test ID string', function () {
		var id = new Response().testID;
		expect(id).toEqual(jasmine.any(String));
	});

	it('should produce unique IDs for each instance', function () {
		var id2, id1;
		id1 = new Response().testID;
		id2 = new Response().testID;
		expect(id1).not.toBe(id2);
	});
});
