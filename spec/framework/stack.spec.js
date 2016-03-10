/*globals jasmine, describe, it, expect*/
/*jslint node: true*/
'use strict';

var stack = require('../../src/framework/stack');
var Emitter = require('events');

describe('The test stack', function () {
	it('should expose the current test', function () {
		expect(stack.current).not.toBe(undefined);
	});

	it('should inherit from EventEmitter', function () {
		expect(stack).toEqual(jasmine.any(Emitter));
	});

	it('should have a list of upcoming tests', function () {
		expect(stack.next).toEqual(jasmine.any(Array));
	});

	it('should have a list of completed tests', function () {
		expect(stack.completed).toEqual(jasmine.any(Array));
	});

	it('should have a "push" function', function () {
		expect(stack.push).toEqual(jasmine.any(Function));
	});

	describe('push function', function () {
		it('should serve the first test', function () {
			// clear the stack
			stack.next = [];
			stack.current = null;
			var obj = {};
			stack.push(obj);
			expect(stack.current).toBe(obj);
		});

		it('should respect queued tests', function () {
			var obj = {};
			// first
			stack.push({});
			// second in line
			stack.push(obj);
			expect(stack.current).not.toBe(obj);
		});
	});

	it('should select the next test when done', function () {
		var obj = {};
		stack.next = [obj];
		stack.emit('done');
		expect(stack.current).toBe(obj);
		expect(stack.next.length).toBe(0);
	});

	it('should mark the last test as done', function () {
		var obj;
		stack.current = obj = {};
		stack.completed = [];
		stack.emit('done');
		expect(stack.completed[0]).toBe(obj);
	});
});
