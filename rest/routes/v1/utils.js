/**
 * Utils module.
 * @module routes/v1/utils
 */
var User = require('../../models/v1/user.js');
var Group = require('../../models/v1/group.js');

var console = process.console;

/**
 * Log function with multiple parameters.
 * @param {String} tag			Description log tag: WARNING, ERROR, INFO...
 * @param {String} method		String with http method
 * @param {Number} httpCode		HTTP result code
 * @param {Object} req 			Request Object
 * @param {Object} user 		User who is performing the action
 */
exports.logger = function(tag, method, httpCode, req, user) {
	console.tag(tag, method, httpCode).log(req.originalUrl, 
		{'ip' : req.ip, 'user' : (user != null) ? user['login'] : '', 'headers' : req.headers, 'body' : req.body});
};

/**
 * Gets username and password from a HTTP request and validates the user in the system.
 * Returns 401 code (Unauthorized) through res header, in case of missing authorization header or login failure.
 * 500 code is return in case of query failure.
 * @param {Object} req 						HTTP Request.
 * @param {Object} res 						HTTP Response. 
 * @param {function} successCallBack(User)	Function executed on successful login.
 */
exports.login = function(req, res, successCallBack) {
	var authorization = req.headers['authorization'] || '';
	if (authorization != '') {
		var token = authorization.split(/\s+/).pop() || '',
			auth = new Buffer(token, 'base64').toString(),
			parts = auth.split(/:/);
			User.Person
			.findOne({'login' : parts[0], 'password' : parts[1]})
			.populate({path: 'groups'})
			.select("-password -_id -_type")
			.exec(function (err, user) {
				if (err) {
					res.sendStatus(500); // 500 Forbidden
					console.tag('ERROR', req.method, 500).log(req.originalUrl, 
						{'ip' : req.ip, 'headers' : req.headers, 'body' : req.body});
				}
				else
					if (user == null) {
						res.sendStatus(401); // 401 Unauthorized
						console.tag('INFO', req.method, 401).log(req.originalUrl, 
							{'ip' : req.ip, 'headers' : req.headers, 'body' : req.body});
					}
					else
						successCallBack(user);
			});
	} else {
		res.sendStatus(401); // 401 Unauthorized
		console.tag('INFO', req.method, 401).log(req.originalUrl, 
			{'ip' : req.ip, 'headers' : req.headers, 'body' : req.body});
	}
};

/**
 * Validates user groups privileges.
 * @params {Object} user 			User json object.
 * @params {Number|Array} levels	Array of allowed privileges to perform the action.
 * @returns {Boolean}				True if user has enough privileges, otherwise returns false.
 */
exports.validateUserPrivileges = function(user, levels) {
	for (var i = 0; i < user.groups.length; i++) {
		var group = user.groups[i];
		
		if (levels.indexOf(group.privilegeLevel) != -1)
			return true;
	}

	return false;
};

/**
 * Checks on the system if the specified group exists.
 * @param {String} groupName 							Group name.
 * @param {function} successCallBack(exists, group)		Resut of the search.
 */
exports.groupExists = function(groupName, successCallBack) {
	Group.findOne({'groupName' : groupName}, function(err, group) {
		if (err || group == null)
			successCallBack(false, null);
		else
			successCallBack(true, group);
	});
};

/**
 * Checks on the system if a user exists.
 * @param {String} login 								User's login.
 * @param {function} successCallBack(exists, user)	Resut of the search.
 */
exports.userExists = function(login, successCallBack) {
	User.Person.findOne({'login' : login, '_type' : 'Person'}, function(err, user) {
		if (err || user == null)
			successCallBack(false, null);
		else
			successCallBack(true, user);
	});
};

/**
 * Checks on the system if the specified station exists.
 * @param {String} MAC 									MAC's station.
 * @param {function} successCallBack(exists, station)	Resut of the search.
 */
exports.stationExists = function(MAC, successCallBack) {
	User.Station.findOne({'login' : MAC, '_type' : 'Station'}, function(err, station) {
		if (err || station == null)
			successCallBack(false, null);
		else
			successCallBack(true, station);
	});
};