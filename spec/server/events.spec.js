/*global jasmine, describe, it, expect*/
/*jslint node: true*/
'use strict';

var stream = require('../../server/events');
var EventEmitter = require('events');

describe('The "events" export', function () {
	it('should be an instance of EventEmitter', function () {
		expect(stream).toEqual(jasmine.any(EventEmitter));
	});
});
