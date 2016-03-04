/*global jasmine, describe, it, expect*/
/*jslint node: true*/
'use strict';

var parse = require('../../../client/configuration/parse');

function condition(val) {
	return {
		conditional: val,
		cb: 'function () {}'
	};
}

describe('The client callback parser', function () {
	it('should be a function', function () {
		expect(parse).toEqual(jasmine.any(Function));
	});

	it('should not throw without input', function () {
		expect(parse).not.toThrow();
	});

	it('should return an array', function () {
		var output = parse([]);
		expect(output).toEqual(jasmine.any(Array));
	});

	it('should return a parsed objects containing callbacks', function () {
		var output = parse([
			condition()
		]);
		expect(output[0]).toEqual(jasmine.any(Object));
	});

	it('should filter against the conditional method', function () {
		var output = parse([
			condition('function () { return false }')
		]);
		expect(output.length).toBe(0);
	});

	it('should accept expressions as conditionals', function () {
		var output = parse([
			condition(false),
			condition('false'),
			condition('typeof true === "boolean"')
		]);
		expect(output.length).toBe(1);
	});

	it('should only return a list of objects', function () {
		var output = parse([
			condition(true),
			condition(false),
			condition('function () { return true }'),
			condition(1)
		]);
		expect(output.length).toBe(3);
		output.forEach(function (cb) {
			expect(cb).toEqual(jasmine.any(Object));
		});
	});

	it('should filter out bad input', function () {
		var output = parse([{
			cb: 5
		}]);
		expect(output.length).toBe(0);
	});
});
