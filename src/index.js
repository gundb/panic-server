/*jslint node: true*/
'use strict';

var axios = require('axios/dist/axios.min.js');

/*
	As soon as we load the page,
	request the configuration
	object.
*/
axios.get(location.origin + '/setup').then(function (res) {
	console.log(res.data);
})['catch'](function (error) {
	console.log(error.message);
});
