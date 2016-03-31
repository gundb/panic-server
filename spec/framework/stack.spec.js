/*globals jasmine, describe, it, expect, beforeEach*/
/*jslint node: true*/
'use strict';

var stack = require('../../src/framework/stack');

describe('The stack', function () {
	var obj = {
		on: function () { return obj; },
		emit: function () { return obj; }
	};

	describe('push method', function () {
		it('should add to the stack', function () {
			stack.next = [];
			stack.current = null;
			stack.push(obj);
			expect(stack.current).toBe(obj);
		});
	});

	describe('shift method', function () {
		it('should change the current test', function () {
			var last = stack.current;
			stack.shift();
			expect(last).not.toBe(stack.current);
		});
	});

	describe('events', function () {
		it('should fire on change', function (done) {
			stack.on('change', done);
			stack.push(obj);
			stack.shift();
		});

		it('should fire on the last test', function (done) {
			stack.next = [];
			stack.push(obj);
			stack.on('last', done);
			stack.shift();
		});
	});
});
