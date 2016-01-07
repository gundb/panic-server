/*jslint node: true, nomen: true */
var port, server, gun, Gun, express = require('express');
server = express();
port = process.argv[2] || 8080;
Gun = require('gun-level');

server.use('/', express['static'](__dirname));

server.listen(port);
gun = new Gun({
	level: {
		blaze: 'results/',
		share: true
	}
}).wsp(server);
server.use(gun.wsp.server);

