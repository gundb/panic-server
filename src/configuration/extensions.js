/*jslint regexp: true, node: true*/
'use strict';

Function.prototype.toJSON = Function.prototype.toString;

var space = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
space += 'abcdefghijklmnopqrstuvwxyz';
space += '1234567890';

String.random = function (length) {
	length = length || 10;
	if (length < 0) {
		return '';
	}
	var str = '';
	while (length) {
		str += space[Math.floor(Math.random() * space.length)];
		length -= 1;
	}
	return str;
};
