/*global jasmine, describe, it, expect*/
/*jslint node: true*/
'use strict';

var parser = require('../../../client/framework/parser');

describe('The client test parser', function () {
	it('should be a function', function () {
		expect(parser).toEqual(jasmine.any(Function));
	});
});
