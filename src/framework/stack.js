/*jslint node: true*/
'use strict';

var Emitter = require('events');
var assign = require('object-assign-deep');
var server = require('../../server');
var stack;

function push(test) {
	if (!stack.current) {
		stack.current = test;
	} else {
		stack.next.push(test);
	}
}

module.exports = stack = new Emitter();
assign(module.exports, {
	current: null,
	next: [],
	completed: [],
	push: push
});

stack.on('done', function () {
	var test = stack.next.shift();
	if (stack.current) {
		stack.completed.push(stack.current);
		stack.current = null;
	}
	if (test) {
		stack.current = test;
	}
});
