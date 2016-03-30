/*jslint node: true*/
'use strict';

var Emitter = require('events');
var assign = require('object-assign-deep');
var server = require('../../server');
var stack;

function push(test) {
	stack.next.push(test);

	if (!stack.current) {
		stack.shift();
	}

	return test;
}

function shift() {
	var test = stack.next.shift();

	if (stack.current) {
		stack.completed.push(stack.current);
		stack.current = null;
	}
	if (test) {
		// shift again when it's done
		test.on('done', stack.shift);
		stack.current = test;
		test.emit('stage');
	} else {
		return stack.emit('finished');
	}
	stack.emit('change', stack.current);
}

stack = module.exports = new Emitter();
stack.setMaxListeners(Infinity);

assign(module.exports, {
	current: null,
	next: [],
	completed: [],
	push: push,
	shift: shift
});
