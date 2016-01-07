/*globals Gun, console, patch, finisher, stats */
function test(opt) {
	'use strict';

	opt = patch(opt);

	var gun, resetDoneTimer, db, confirmed = {};
	resetDoneTimer = finisher();
	gun = new Gun(opt.peers);
	db = gun.get(opt.key);

	function ack(num) {
		return function (err, ok) {
			if (confirmed[num] && !err) {
				return;
			}
			var request = opt.requests[num - 1];
			request.end = Gun.time.is();
			if (err) {
				request.errors.push(err);
			}
			confirmed[num] = true;
			opt.progress(opt, num);
			resetDoneTimer(db, stats(opt));
		};
	}

	function run(num) {
		var cb, packet = opt.packet();
		cb = ack(num);
		opt.requests[num - 1] = {
			start: packet.time,
			errors: []
		};

		db.path(opt.path).path(Gun.text.random()).put(packet, cb);

		if (num === opt.packets) {
			return;
		}

		setTimeout(function () {
			run(num + 1);
		}, opt.interval);

		return opt;
	}
	resetDoneTimer(db, opt);

	return run(1);
}




if (typeof window !== 'undefined') {
	if (window.options) {
		test(window.options);
	}
}
