/**
 * Groups module
 * @module routes/v1/groups
 */
var Group = require('../../models/v1/group');
var User = require('../../models/v1/user')
var utils = require('./utils');
var express = require('express');

var router = express.Router();

router.route('/groups')
	/**
	 * GET /groups
	 * Authorization required. Username and password encoded with Base64.
	 * Privilege level required: 0 or 1.
	 * 200 OK						Group collection is sended.
	 * 401 Unauthorized				Missing authorization header or unsuccessful login.
	 * 403 Forbidden				Successful login but not enough privileges to perform the action.
	 * 500 Internal Server Error	Failure in database query.
	 */
	.get(function(req, res) {
		utils.login(req, res, function(user) {
			if (utils.validateUserPrivileges(user, [0, 1])) {
				Group.find(function(err, groups) {
					if (err) {
						res.sendStatus(500); // 500 Internal Server Error
						utils.logger('ERROR', req.method, 500, req, user);
					}
					else {
						res.send(groups); // 200 OK
						utils.logger('INFO', req.method, 200, req, user);
					}
				});
			} else {
				res.sendStatus(403); // 403 Forbidden
				utils.logger('WARNING', req.method, 403, req, user);
			}
		});
	});

router.route('/groups/:groupName')
	/**
	 * GET /groups/:groupName
	 * Authorization required. Username and password encoded with Base64.
	 * Privilege level required: 0 or 1.
	 * 200 OK						Detail of the specified group are sended.
	 * 401 Unauthorized				Missing authorization header or unsuccessful login.
	 * 403 Forbidden				Successful login but not enough privileges to perform the action.
	 * 404 Not Found				Group not found.
	 * 500 Internal Server Error	Failure in database query.
	 */
	.get(function(req, res) {
		utils.login(req, res, function(user) {
			if (utils.validateUserPrivileges(user, [0, 1])) {
				Group.findOne({'groupName' : req.params.groupName}, function(err, group) {
					if (err) {
						res.sendStatus(500); // 500 Internal Server Error
						utils.logger('ERROR', req.method, 500, req, user);
					}
					else
						if (group == null) {
							res.sendStatus(404); // 404 Not Found
							utils.logger('INFO', req.method, 404, req, user);
						}
						else {
							res.send(group); // 200 OK
							utils.logger('INFO', req.method, 200, req, user);
						}
				});
			} else {
				res.sendStatus(403); // 403 Forbidden
				utils.logger('WARNING', req.method, 403, req, user);
			}
		});
	});

router.route('/groups/:groupName/users')
	/**
	 * GET /groups/:groupName/users
	 * Authorization required. Username and password encoded with Base64.
	 * Privilege level required: 0 or 1.
	 * 200 OK						Users from the specified group are sended.
	 * 401 Unauthorized				Missing authorization header or unsuccessful login.
	 * 403 Forbidden				Successful login but not enough privileges to perform the action.
	 * 404 Not Found				Group not found.
	 * 500 Internal Server Error	Failure in database query.
	 */
	.get(function(req, res) {
		utils.login(req, res, function(user) {
			if (utils.validateUserPrivileges(user, [0, 1])) {
				utils.groupExists(req.params.groupName, function(exists, group) {
					if (exists) {
						User.Person
						.find({'groups' : group._id})
						.populate({path: 'groups'})
						.select("-password -_id -_type")
						.exec(function(err, users) {
							if (err) {
								res.sendStatus(500); // 500 Internal Server Error
								utils.logger('ERROR', req.method, 500, req, user);
							}
							else {
								res.send(users); // 200 OK
								utils.logger('INFO', req.method, 200, req, user);
							}
						});	
					} else {
						res.sendStatus(404); // 404 Not Found
						utils.logger('INFO', req.method, 404, req, user);
					}
				});
			} else {
				res.sendStatus(403); // 403 Forbidden
				utils.logger('WARNING', req.method, 403, req, user);
			}
		});
	});

module.exports = router;