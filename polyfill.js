/*globals Gun, console*/

Object.keys = Object.keys || function (obj) {
	'use strict';
	var key, keys = [];
	for (key in obj) {
		if (obj.hasOwnProperty(key)) {
			keys.push(key);
		}
	}
	return keys;
};
Object.values = Object.values || function (obj) {
	'use strict';
	return Object.keys(obj).map(function (key) {
		return obj[key];
	});
};
var setImmediate = setImmediate || function (cb) {
	'use strict';
	setTimeout(cb, Infinity);
};
console.log = (function () {
	'use strict';
	var peersError, log = console.log;
	peersError = 'Warning! You have no peers to connect to!';
	return function (msg) {
		if (msg === peersError) {
			return;
		}
		log.apply(console, arguments);
	};
}());

Gun.chain.each = function (cb, end) {
	'use strict';
	var n = function () {},
		count = 0,
		props = [],
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
