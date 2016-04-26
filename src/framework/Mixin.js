/*jslint node: true*/
'use strict';

var Test = require('./Test');

// String.random, function.toJSON
require('../extensions');

function Mixin(title, cb) {
	if (!(this instanceof Mixin)) {
		return new Mixin(title, cb);
	}
	if (typeof title !== 'string') {
		cb = title;
	}
	if (typeof cb === 'function') {
		cb = [cb];
	}
	if (!(cb instanceof Array)) {
		throw new Error('No mixin callbacks');
	}
	if (typeof title === 'string') {
		if (Mixin.list[title]) {
			throw new Error('Mixin name "' + title + '" has been used already.');
		}
		Mixin.list[title] = this;
	}
	this.cb = cb;
}
Mixin.list = {};

module.exports = Test.Mixin = Mixin;
