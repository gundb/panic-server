/*jslint node: true*/
'use strict';

var Emitter = require('events');
var assign = require('object-assign-deep');
var server = require('../../server');
var stack;

function push(test) {
	test.on('done', stack.shift);

	if (!stack.current) {
		stack.current = test;
	} else {
		stack.next.push(test);
	}
}

function shift() {
	var test = stack.next.shift();
	if (stack.current) {
		stack.completed.push(stack.current);
		stack.current = null;
	}
	if (test) {
		stack.current = test;
	}
	stack.emit('shift', stack.current);
}

module.exports = stack = new Emitter();
assign(module.exports, {
	current: null,
	next: [],
	completed: [],
	push: push,
	shift: shift
});

/*
	Our server won't be running
	if there are no tests.
*/
server.on('join', function (socket) {
	console.log('Sending', stack.current);
	socket.emit('test', stack.current);
});
