/**
 * Login module
 * @module routes/v1/login
 */
var User = require('../../models/v1/user.js');
var utils = require('./utils');
var express = require('express');

var router = express.Router();

router.route('/login')
	/**
	 * GET /login
	 * Authorization required. Username and password encoded with Base64.
	 * 200 OK				Loggin successful. User document is sended.
	 * 401 Unauthorized		Missing authorization header or unsuccessful login.
	 * 500 Forbidden		Failure in database query.
	 */
	.get(function(req, res) {
		utils.login(req, res, function(user) {
			res.send(user); // 200 OK
			utils.logger('INFO', req.method, 200, req, user);
		});
	});

module.exports = router;