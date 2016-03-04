/*global jasmine, describe, it, expect, beforeAll*/
/*jslint node: true*/
'use strict';

var Gun = require('gun/gun');

describe('The extension', function () {
	var polyfill = require('../../lib/configuration/extensions');
	describe('keys method', function () {
		// cannot delete Object.keys for testing
		// node internals depend on it
		var keys = polyfill.keys;

		it('should be a function', function () {
			expect(polyfill.keys).toEqual(jasmine.any(Function));
		});

		it('should return an array', function () {
			expect(keys({})).toEqual(jasmine.any(Array));
		});

		// more specifically, it will replace it if it doesn't exist
		it('should return an array', function () {
			expect(keys({
				1: 1
			}).length).toBe(1);
		});

		it('should not fail without input', function () {
			expect(keys).not.toThrow();
		});

		it('should survive bad inputs', function () {
			keys(null); // shouldn't throw
			keys(undefined); // shouldn't throw
			keys(0); // shouldn't throw
			keys(NaN); // shouldn't throw
			keys(Infinity); // shouldn't throw
		});

		it('should return a list of keys', function () {
			expect(keys({
				name: true
			})[0]).toBe('name');
		});
	});

	describe('values method', function () {
		var values = polyfill.values;
		it('should be a function', function () {
			expect(values).toEqual(jasmine.any(Function));
		});

		it('should return an array', function () {
			expect(values({})).toEqual(jasmine.any(Array));
		});

		it('should return a list of object values', function () {
			expect(values({
				1: 5
			})[0]).toBe(5);
		});

		it('should be able to handle no input', function () {
			expect(values).not.toThrow();
		});

		it('should be able to handle bad input', function () {
			values(null); // shouldn't throw
			values(undefined); // shouldn't throw
			values(NaN); // shouldn't throw
			values(Infinity); // shouldn't throw
			values(0); // shouldn't throw
		});
	});

	describe('JSON function support', function () {
		it('should allow you to stringify functions', function () {
			var result = JSON.stringify(function () {});
			expect(result).toBeTruthy();
		});

		it('should provide a toJSON method', function () {
			expect(Function.prototype.toJSON).toEqual(jasmine.any(Function));
		});

		it('should allow functions anywhere in JSON', function () {
			var result = JSON.stringify({
				cb: function () {
					// do stuff
				}
			});
			result = JSON.parse(result);
			expect(result.cb).toBeTruthy();
		});
	});

	describe('parse method', function () {
		it('should be a function', function () {
			expect(Function.parse).toEqual(jasmine.any(Function));
		});

		it('should parse stringified functions', function (done) {
			var string = JSON.parse(JSON.stringify(function (finished) {
				finished();
			}));
			Function.parse(string)(done);
		});

		it('should parse anonymous functions', function () {
			var func = JSON.parse(JSON.stringify(function () {}));
			Function.parse(func); // shouldn't throw
		});

		it('should parse named functions', function () {
			var func = JSON.parse(JSON.stringify(function test() {}));
			Function.parse(func); // shouldn't throw
		});

		it('should return the value if not a function', function () {
			expect(Function.parse('true')).toBe(true);
			expect(Function.parse(true)).toBe(true);
			expect(Function.parse('5')).toBe(5);
		});
	});

	describe('gun.each method', function () {
		it('should be a function', function () {
			expect(Gun.chain.each).toEqual(jasmine.any(Function));
		});
	});
});
