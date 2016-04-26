var panic = require('panic-server');
panic.serve(8080, 'localhost');
var browsers = panic.clients.filter(function (client) {
	return client.platform !== 'Node.js';
});
var servers = panic.clients.excluding(browsers);
servers.matching({
	os: /OS X/
});
servers.update('gun', {
	key: 'panic-test',
	path: 'stuff'
});
servers.run(function (done) {
	// do things
	done();
})
.then(function () {
	// do things
})
.catch(function () {
	// do things
});

function Test(name, cb) {
	this.name = name;
	this.cb = cb;
	this.TDO = {};
}
Test.prototype = {
	toJSON: function () {
		return this.TDO;
	}
};
