/*globals Gun, console, patch */
var test, gun;

test = function (opt) {
	'use strict';

	opt = patch(opt);
	var i, count, db;
	gun = new Gun(opt.peers);
	db = gun.get(opt.key).set();
	count = 0;

	function ack(num) {
		return function (err, ok) {
			count += 1;
			console.log('ACK:', err, ok, 'on', num);
			if (count === opt.amount) {
				console.log('0% loss');
			}
		};
	}
	function run(num) {
		db.set(opt.data, ack(num));

		if (num === opt.amount) {
			return db;
		}
		setTimeout(function () {
			run(num + 1);
		}, opt.interval > 16 ? opt.interval : Infinity);
		return db;
	}

	return run(0);
};
