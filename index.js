/*globals Gun, console, patch */
var test, gun;

test = function (opt) {
	'use strict';
	opt = patch(opt);
	var i, count, db = gun.get(opt.key).set();
	gun = new Gun(opt.peers);
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
	for (i = 1; i <= opt.amount; i += 1) {
		db.set(opt.data, ack(i));
	}
	return db;
};
