/*globals Gun, type, console*/
/*
	Return an object like this:


	return {
		expect: Object,
		done: Function,
		progress: Function,
		interval: Number,
		peers: Array,
		packets: Number,
		id: String,
		key: String,
		path: String,
		packet: Function
	};

*/
var patch;
(function () {
	'use strict';
	var random = Gun.text.random;

	function is(data, expected) {
		var string, error, actual = type(data);
		if (actual !== expected) {
			string = JSON.stringify(data);
			error = 'Expected ' + expected + ', was ' + actual + ': ' + string;
			throw new TypeError(error);
		}
		return true;
	}

	function or(obj, prop, val) {
		return (obj[prop] = obj[prop] || val);
	}

	function done(opt) {
		or(opt, 'done', {});
		or(opt.done, 'cb', function () {
			console.log('No finishing callback');
		});
		or(opt.done, 'timeout', 2000);
		is(opt.done, 'object');
		is(opt.done.timeout, 'number');
		is(opt.done.cb, 'function');
	}

	function packet(opt) {

		// wrap the packet function
		// set time and id for
		// every returned object
		opt.packet = (function () {
			var makePacket = opt.packet || function () {
				return random();
			};

			return function () {
				return {
					data: makePacket(),
					time: Gun.time.is(),
					id: opt.id
				};
			};
		}());

		is(opt.packet(), 'object');
	}


	patch = function (opt) {
		var url = location.protocol + '//';
		url += location.host;
		url += '/gun';

		opt = opt || {};
		opt.interval = opt.interval || 0;
		opt.peers = opt.peers || [url];
		opt.packets = opt.packets || 50;
		opt.id = opt.id || random(10);
		opt.key = opt.key || random(15);
		opt.path = opt.path || random(5);
		opt.requests = [];
		opt.requests.start = Gun.time.is();
		or(opt, 'progress', function (opt, num) {
			console.log('Saved', num);
		});
		done(opt);
		packet(opt);


		is(opt.key, 'string');
		is(opt.interval, 'number');
		is(opt.peers, 'array');
		is(opt.packets, 'number');
		is(opt.id, 'string');
		is(opt.path, 'string');
		is(opt.progress, 'function');

		if (opt.packets < 0) {
			throw new RangeError("Negative packets? Are you crazy?");
		}

		return opt;
	};

}());
