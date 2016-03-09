/*global jasmine, describe, it, expect, beforeAll*/
/*jslint node: true*/
'use strict';

require('../../src/configuration/extensions');

describe('String.random', function () {
	it('should be a function', function () {
		expect(String.random).toEqual(jasmine.any(Function));
	});

	it('should return an empty string without input', function () {
		expect(String.random()).toEqual(jasmine.any(String));
	});

	it('should set the length by arg0', function () {
		expect(String.random(10).length).toBe(10);
	});

	it('should survive negative input', function () {
		expect(String.random(-5).length).toBe(0);
	});

	it('should default to 10 chars long', function () {
		expect(String.random().length).toBe(10);
	});
});

describe('function.toJSON', function () {
	var proto = Function.prototype;
	it('should be a function', function () {
		expect(proto.toJSON).toEqual(jasmine.any(Function));
	});

	it('should just be (function).toString', function () {
		expect(proto.toJSON).toBe(proto.toString);
	});
});
