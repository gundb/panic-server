/*jslint regexp: true, evil: true, node: true*/
/*globals Gun, console*/
'use strict';


var Gun = require('gun/gun');

function keys(obj) {
	var key, all = [];
	for (key in obj) {
		if (obj.hasOwnProperty(key)) {
			all.push(key);
		}
	}
	return all;
}

function values(obj) {
	return keys(obj).map(function (key) {
		return obj[key];
	});
}

Object.keys = Object.keys || keys;
Object.values = Object.values || values;

console.log = console.log.bind(console);

Gun.log.squelch = true;

Gun.chain.each = function (cb, end) {
	var count, props, gun, n = function () {};
	count = 0;
	props = [];
	gun = this;

	cb = cb || n;
	end = end || n;

	gun.val(function (list) {
		var args = Array.prototype.slice.call(arguments);
		Gun.is.node(list, function (n, prop) {
			count += 1;
			props.push(prop);
		});
		props.forEach(function (prop) {
			gun.path(prop).val(function (val, key) {
				count -= 1;
				cb.apply(this, arguments);
				if (!count) {
					end.apply(this, args);
				}
			});
		});
	});
	return gun;
};

Function.prototype.toJSON = Function.prototype.toString;

Function.parse = function (string) {
	var val;
	eval('val = ' + string);
	return val;
};

// export for jasmine tests
module.exports = {
	keys: keys,
	values: values
};
