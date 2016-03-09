/*jslint regexp: true, node: true*/
'use strict';

console.log = console.log.bind(console);

Function.prototype.toJSON = Function.prototype.toString;

String.random = function (length) {
	length = length || 10;
	if (length < 0) {
		return '';
	}
	var str, space = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	space += 'abcdefghijklmnopqrstuvwxyz';
	space += '1234567890';
	str = '';
	while (length) {
		str += space[Math.floor(Math.random() * space.length)];
		length -= 1;
	}
	return str;
};
