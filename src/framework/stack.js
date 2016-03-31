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
	var last, test = stack.next.shift();

	if (stack.current) {
		last = stack.current;
		stack.completed.push(last);
		stack.current = null;
	}
	if (test) {
		// shift again when it's done
		test.on('done', stack.shift).emit('stage');
		stack.current = test;
	} else {
		stack.emit('last', last);
		if (last.hasEnded) {
			stack.emit('finished', last);
		} else {
			last.on('done', function () {
				stack.emit('finished', last);
			});
		}
	}
	stack.emit('change', stack.current);
}

stack = module.exports = new Emitter();
stack.setMaxListeners(Infinity);

assign(stack, {
	current: null,
	next: [],
	completed: [],
	push: push,
	shift: shift
});
