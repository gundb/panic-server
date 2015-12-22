/*globals patch*/
var Browser;
(function () {
	'use strict';

	Browser = function (opt) {
		if (!(this instanceof Browser)) {
			return new Browser(opt);
		}
		var browser = this;
		browser.opt = opt;
		opt.done.cb = (function () {
			var cb = opt.done.cb;
			return function (opt) {
				if (cb) {
					cb.apply(this, arguments);
				}
				browser.close();
			};
		}());
		browser.window = window.open('./', browser.opt.id);
		browser.window.addEventListener('load', function () {
			browser.window.test(browser.opt);
		});
	};

	Browser.prototype = {
		constructor: Browser,
		close: function () {
			this.window.close();
			return this;
		}
	};

}());
