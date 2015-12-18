/*jslint node: true, nomen: true */
var port, app, express = require('express');
app = express();
port = process.argv[2] || 8080;

app.use('/', express['static'](__dirname));

require('gun-level')().attach(app);
app.listen(port);
