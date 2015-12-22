/*globals Gun, console, stats */

/*
	check it against opt.id
	make sure everything is fabulous

	begin with a timeout + interval,
	restart on each acknowledgment
*/
function finisher() {
	'use strict';

	return (function () {
		var timeout;

		function done(db, opt) {
			var saved = 0;
			opt.requests.end = Gun.time.is();

			function scan(obj) {
				if (obj.id === opt.id) {
					saved += 1;
				}
			}

			db.path(opt.path).each(scan, function () {
				stats(opt, saved);
				opt.done.cb(opt);
			});
		}

		return function (db, opt) {
			clearTimeout(timeout);
			timeout = setTimeout(function () {
				done(db, opt);
			}, opt.interval + opt.done.timeout);
		};



	}());
}
