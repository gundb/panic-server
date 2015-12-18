/*globals Gun*/
/*
	Expect an object like this:


	var thing = {
		interval: Number,
		peers: Array,
		amount: Number,
		id: String,
		key: String,
		path: String,
		data: *
	};

*/

function patch(opt) {
	'use strict';
	var url = location.protocol + '//';
	url += location.host;
	url += '/gun';

	opt = opt || {};
	opt.key = opt.key || 'panic/test/';
	opt.interval = opt.interval || 0;
	opt.peers = opt.peers || [url];
	opt.amount = opt.amount || 300;
	opt.id = opt.id || Gun.text.random();
	opt.path = opt.path || Gun.text.random();
	opt.data = opt.data || Gun.text.random();
	return opt;
}
