/**
 * Users module
 * @module routes/v1/users
 */
var User = require('../../models/v1/user.js');
var utils = require('./utils');
var express = require('express');

var router = express.Router();

router.route('/users')
	/**
	 * GET /users
	 * Authorization required. Username and password encoded with Base64.
	 * Privilege level required: 0 or 1.
	 * 200 OK						Users collection (not stations).
	 * 401 Unauthorized				Missing authorization header or unsuccessful login.
	 * 403 Forbidden				Successful login but not enough privileges to perform the action.
	 * 500 Internal Server Error	Failure in database query.
	 */
	.get(function(req, res) {
		utils.login(req, res, function(user) {
			if (utils.validateUserPrivileges(user, [0, 1])) {
				User.Person
				.find({'_type' : 'Person'})
				.populate({path: 'groups'})
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
				res.sendStatus(403); // 403 Forbidden
				utils.logger('WARNING', req.method, 403, req, user);
			}
		});
	})

	/**
	 * POST /users
	 * Authorization required. Username and password encoded with Base64.
	 * Privilege level required: 0.
	 * 201 Created					User added successfully.
	 * 400 Bad Request				Bad format.
	 * 401 Unauthorized				Missing authorization header or unsuccessful login.
	 * 403 Forbidden				Successful login but not enough privileges to perform the action.
	 */
	.post(function(req, res) {
		utils.login(req, res, function(user) {
			if (utils.validateUserPrivileges(user, [0])) {
				var person = new User.Person(req.body);
				person.save(function(err) {
					if (err) {
						res.status(400).send(err); // 400 Bad Request
						utils.logger('INFO', req.method, 400, req, user);
					}
					else {
						res.status(201).send({message: 'User added'}); // 201 Created
						utils.logger('INFO', req.method, 201, req, user);
					}
				});
			} else {
				res.sendStatus(403); // 403 Forbidden
				utils.logger('WARNING', req.method, 403, req, user);
			}
		});
	});

	
router.route('/users/:login')
	/**
	 * PUT /users/:login
	 * Authorization required. Username and password encoded with Base64.
	 * Privilege level required: 0.
	 * 200 OK						User modified successfully.
	 * 400 Bad Request				Bad format.
	 * 401 Unauthorized				Missing authorization header or unsuccessful login.
	 * 403 Forbidden				Successful login but not enough privileges to perform the action.
	 * 404 Not Found				The specified user doesn't exist.
	 */
	.put(function(req, res) {
		utils.login(req, res, function(user) {
			if (utils.validateUserPrivileges(user, [0, 1])) {
				utils.userExists(req.params.login, function(exists) {
					if (exists) {
						if (user.login === req.params.login) {
							if (req.body.password != null) {
								user.password = req.body.password;
							}
							if (req.body.groups != null) {
								user.groups = req.body.groups;
							}
							if (req.body.data != null) {
								if (req.body.data.name != null) {
									user.data.name = req.body.data.name;
								}
								if (req.body.data.secondName != null) {
									user.data.secondName = req.body.data.secondName;
								}
								if (req.body.data.dateOfBirth != null) {
									user.data.dateOfBirth = req.body.data.dateOfBirth;
								}
							}
							user.save(function (err) {
								if (err) {
									res.status(400).send(err); // 400 Bad Request
									utils.logger('INFO', req.method, 400, req, user);
								} else {
									res.send(user); // 200 OK
									utils.logger('INFO', req.method, 200, req, user);
								}
							});
						} else {
							res.sendStatus(403); // 403 Forbidden
							utils.logger('WARNING', req.method, 403, req, user);
						}
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
	})
	
	/**
	 * DELETE /users/:login
	 * Authorization required. Username and password encoded with Base64.
	 * Privilege level required: 0.
	 * 200 OK						User deleted successfully.
	 * 401 Unauthorized				Missing authorization header or unsuccessful login.
	 * 403 Forbidden				Successful login but not enough privileges to perform the action.
	 * 404 Not Found				The specified user doesn't exist.
	 * 500 Internal Server Error	Failure in database query.
	 */
	.delete(function(req, res) {
		utils.login(req, res, function(user) {
			if (utils.validateUserPrivileges(user, [0])) {
				User.Person.findOne({'_type': 'Person', 'login' : req.params.login}, function(err, userToDelete) {
					if (err) {
						res.sendStatus(500); // 500 Internal Server Error
						utils.logger('ERROR', req.method, 500, req, user);
					}
					else
						if (userToDelete == null) {
							res.sendStatus(404); // 404 Not Found
							utils.logger('INFO', req.method, 404, req, user);
						}
						else {
							userToDelete.remove();
							res.send({message: 'User deleted!'}); // 200 OK
							utils.logger('INFO', req.method, 200, req, user);
						}
				});
			} else {
				res.sendStatus(403); // 403 Forbidden
				utils.logger('WARNING', req.method, 403, req, user);
			}
		});
	})

	.put(function(req, res) {

	});

module.exports = router;
