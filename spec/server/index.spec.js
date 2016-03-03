/*global jasmine, describe, it, expect*/
/*jslint node: true*/
'use strict';

var route = require('../../server/index');
var axios = require('axios');

describe('The router', function () {
	var root = String(route);

	it('should have a toString property', function () {
		var stringy = route.hasOwnProperty('toString');
		expect(stringy).toBe(true);
	});

	it('should export the current port', function () {
		expect(route.port).toEqual(jasmine.any(Number));
	});

	it('should export the hostname', function () {
		expect(route.host).toEqual(jasmine.any(String));
	});

	it('should return the full URL when `toString`ed', function () {
		expect(route.toString()).toMatch(/http/i);
	});

	it('should export middleware methods', function () {
		expect(route.root).toEqual(jasmine.any(Function));
		expect(route.setup).toEqual(jasmine.any(Function));
		expect(route.progress).toEqual(jasmine.any(Function));
		expect(route.done).toEqual(jasmine.any(Function));
	});

	it('should always respond', function (done) {
		var num = 0;
		// Count responses. There should be 4 total
		function req(type, url) {
			axios[type](root + url).then(function () {
				if ((num += 1) === 4) {
					done();
				}
			});
		}
		req('get', '');
		req('get', 'setup');
		req('post', 'progress');
		req('post', 'done');
	});

	it('should serve the homepage on root request', function (done) {
		axios.get(root).then(function (res) {
			expect(res.data).toMatch(/html/i);
			done();
		});
	});

	it('should expose the router interface', function () {
		expect(route.router).toEqual(jasmine.any(Function));
	});

	it('should hot-swap routes', function (done) {
		// root needs to pass off to the other functions
		// with the "next" method
		route.root = function (req, res, next) {
			done();
			next();
		};
		axios.get(root);
	});

	it('should listen for "progress" updates', function (done) {
		route.progress = done;
		axios.post(root + 'progress');
	});

	it('should listen for "done" updates', function (done) {
		route.done = done;
		axios.post(root + 'done');
	});

	it('should pass the express args through', function (done) {
		route.root = function (req, res, next) {
			expect(req).toEqual(jasmine.any(Object));
			expect(res).toEqual(jasmine.any(Object));
			expect(next).toEqual(jasmine.any(Function));
			done();
		};
		axios.get(root);
	});

});
