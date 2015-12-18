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
	if (!opt) {
		throw new Error('No options provided');
	}
	if (!opt.id) {
		throw new Error('No ID given');
	}
	var url = location.protocol + '//';
	url += location.host;
	url += '/gun';

	opt.key = opt.key || 'panic/test/';
	opt.interval = opt.interval || 20;
	opt.peers = opt.peers || [url];
	opt.amount = opt.amount || 1000;
	opt.path = opt.path || Gun.text.random();
	opt.data = opt.data || Gun.text.random();
	return opt;
}
