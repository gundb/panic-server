/*global jasmine, describe, it, expect*/
/*jslint node: true*/
'use strict';

var bump = require('../../server/bump');
var route = require('../../server/index');
var axios = require('axios');
var event = require('../../server/events');
var root = String(route);

describe('The bump function', function () {
	it('should be a function', function () {
		expect(bump).toEqual(jasmine.any(Function));
	});

	it('should update the "setup" route', function () {
		var original = route.setup;
		bump();
		expect(route.setup).not.toBe(original);
	});

	it("should serve it's arg on the `setup` route", function (done) {
		bump({ success: true });
		axios.get(root + 'setup').then(function (res) {
			expect(res.data.success).toBe(true);
			done();
		});
	});

	it('should emit the "begin" event', function (done) {
		event.on('begin', done);
		bump({});
	});

	it('should provide the context to the "begin" cb', function () {
		var obj = {};
		event.on('begin', function (ctx) {
			expect(ctx).toBe(obj);
		});
		bump(obj);
	});
});
