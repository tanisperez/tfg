/**
 * Rest Service main file
 * Estanislao R. Pérez Nartallo
 * 
 * This source code is under GPLv3 license.
 * https://github.com/tanisperez/tfg
 */

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var auth = require('http-auth');
var scribe = require('scribe-js')();

var config = require('./config');

/* Routes for API Version 1 */
var v1 = {};
v1.login = require('./routes/v1/login');
v1.users = require('./routes/v1/users');
v1.groups = require('./routes/v1/groups');
v1.stations = require('./routes/v1/stations');
v1.logs = require('./routes/v1/logs');

var app = express();
var console = process.console;

if (process.argv.slice(2)[0] === 'test') {
	console.addLogger('test');
	console.log = console.test;
}

console.tag('INFO').log('Starting REST Service v' + config.version.service + ' API v' + config.version.api);

var connectionString = 'mongodb://' + config.db.host + ':' + config.db.port + '/';
if (process.argv.slice(2)[0] === 'test') {
	connectionString += config.db.name.testing;
} else {
	connectionString += config.db.name.release;
}

mongoose.connect(connectionString, function(err) {
	if (err) {
		console.tag('ERROR').log('Couldn\'t connect to ' + connectionString);
		process.exit(1);
	}
	else
		console.tag('INFO').log('Connected to ' + connectionString);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


/* API Version 1 */
app.use('/v1/', v1.login);
app.use('/v1/', v1.users);
app.use('/v1/', v1.groups);
app.use('/v1/', v1.stations);

/* Loggin system */
app.use('/logs', auth.connect(v1.logs), scribe.webPanel());

console.tag('INFO').log('REST Service successfully started!');

module.exports = app;