/*globals Gun*/
function stats(opt, saved) {
	'use strict';
	var average, slowest, fastest, elapsed, acks = [];
	fastest = null;
	slowest = null;
	average = 0;
	acks = opt.requests.filter(function (request) {
		return Boolean(request.end);
	});
	acks.forEach(function (ack) {
		var time = ack.end - ack.start;
		if (time > slowest) {
			slowest = time;
		}
		if (time < fastest || !fastest) {
			fastest = time;
		}
		average += (ack.end - ack.start);
	});
	average = average / acks.length;
	elapsed = (opt.requests.end - opt.requests.start) - opt.done.timeout - opt.interval;
	opt.stats = {
		'average latency': average,
		requested: opt.packets,
		acknowledged: acks.length,
		'slowest response': slowest,
		'fastest response': fastest,
		'total elapsed': elapsed || Gun.time.is() - opt.requests.start
	};

	if (saved !== undefined) {
		opt.stats.confirmed = saved;
	}

	return opt;
}
