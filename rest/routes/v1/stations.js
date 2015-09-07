/**
 * Stations module
 * @module routes/v1/stations
 */
var User = require('../../models/v1/user');
var Sample = require('../../models/v1/sample');
var utils = require('./utils');
var express = require('express');
var util = require('util');

var router = express.Router();

router.route('/stations')
	/**
	 * GET /stations
	 * Authorization required. Username and password encoded with Base64.
	 * Privilege level required: 0 or 1.
	 * 200 OK						Station collection is sended.
	 * 401 Unauthorized				Missing authorization header or unsuccessful login.
	 * 403 Forbidden				Successful login but not enough privileges to perform the action.
	 * 500 Internal Server Error	Failure in database query.
	 */
	.get(function(req, res) {
		utils.login(req, res, function(user) {
			if (utils.validateUserPrivileges(user, [0, 1])) {
				User.Station
				.find({'_type' : 'Station'})
				.populate({path: 'groups'})
				.select("-password -_id -_type")
				.exec(function(err, stations) {
					if (err) {
						res.sendStatus(500); // 500 Internal Server Error
						utils.logger('ERROR', req.method, 500, req, user);
					}
					else {
						res.send(stations); // 200 OK
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
	 * POST /stations
	 * Authorization required. Username and password encoded with Base64.
	 * Privilege level required: 0.
	 * 201 Created					Station added successfully.
	 * 400 Bad Request				Bad format.
	 * 401 Unauthorized				Missing authorization header or unsuccessful login.
	 * 403 Forbidden				Successful login but not enough privileges to perform the action.
	 */
	.post(function(req, res) {
		utils.login(req, res, function(user) {
			if (utils.validateUserPrivileges(user, [0])) {
				var station = new User.Station(req.body);
				station.save(function(err) {
					if (err) {
						res.status(400).send(err); // 400 Bad Request
						utils.logger('INFO', req.method, 400, req, user);
					}
					else {
						res.status(201).send({message: 'Station added'}); // 201 Created
						utils.logger('INFO', req.method, 201, req, user);
					}
				});
			} else {
				res.sendStatus(403); // 403 Forbidden
				utils.logger('WARNING', req.method, 403, req, user);
			}
		});
	});

router.route('/stations/:MAC')
	/**
	 * GET /stations/:MAC
	 * Authorization required. Username and password encoded with Base64.
	 * Privilege level required: 0 or 1.
	 * 200 OK						Station document is sended.
	 * 401 Unauthorized				Missing authorization header or unsuccessful login.
	 * 403 Forbidden				Successful login but not enough privileges to perform the action.
	 * 404 Not Found				Station not found.
	 * 500 Internal Server Error	Failure in database query.
	 */
	.get(function(req, res) {
		utils.login(req, res, function(user) {
			if (utils.validateUserPrivileges(user, [2])) {
				User.Station
					.findOne({'login' : req.params.MAC})
					.select("-_id data.wifi data.wifiPassword data.ip data.port data.interval")
					.exec(function(err, station) {
						if (err) {
							res.sendStatus(500); // 500 Internal Server Error
							utils.logger('ERROR', req.method, 500, req, user);
						}
						else
							if (station == null) {
								res.sendStatus(404); // 404 Not Found
								utils.logger('INFO', req.method, 404, req, user);
							}
							else {
								var minimalJSON = util.format('{"wifi":"%s","wifiPassword":"%s","ip":"%s","port":%d,"interval":%d}',
									station.data.wifi, station.data.wifiPassword, station.data.ip, station.data.port, station.data.interval);
								res.set('Content-Type', 'application/json');
								res.send(minimalJSON); // 200 OK
								utils.logger('INFO', req.method, 200, req, user);
							}
					});
			} else
				if (utils.validateUserPrivileges(user, [0, 1])) {
					User.Station
					.findOne({'login' : req.params.MAC})
					.populate({path: 'groups'})
					.select("-password -_id -_type")
					.exec(function(err, station) {
						if (err) {
							res.sendStatus(500); // 500 Internal Server Error
							utils.logger('ERROR', req.method, 500, req, user);
						}
						else
							if (station == null) {
								res.sendStatus(404); // 404 Not Found
								utils.logger('INFO', req.method, 404, req, user);
							}
							else {
								res.send(station); // 200 OK
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
	 * PUT /stations/:MAC
	 * Authorization required. Username and password encoded with Base64.
	 * Privilege level required: 0.
	 * 200 OK						Station deleted successfully.
	 * 400 Bad Request				Bad format.
	 * 401 Unauthorized				Missing authorization header or unsuccessful login.
	 * 403 Forbidden				Successful login but not enough privileges to perform the action.
	 * 404 Not Found				The specified user doesn't exist.
	 */
	.put(function(req, res) {
		utils.login(req, res, function(user) {
			if (utils.validateUserPrivileges(user, [0])) {
				User.Station.findOne({'login' : req.params.MAC, '_type' : 'Station'}, function(err, station) {
					if (err || station == null) {
						res.sendStatus(404); // 404 Not Found
						utils.logger('INFO', req.method, 404, req, user);
					} else {
						if (req.body.password != null) {
							station.password = req.body.password;
						}
						if (req.body.data != null) {
							for (var item in req.body.data) {
								if (item === "dateOfRegistration") // Don't allow to change dateOfRegistration
									continue;
								if (station.data[item] != null) // Just allow to edit the fields
									station.data[item] = req.body.data[item];
							}
						}
						station.save(function (err) {
							if (err) {
								res.status(400).send(err); // 400 Bad Request
								utils.logger('INFO', req.method, 400, req, user);
							} else {
								res.sendStatus(200); // 200 OK
								utils.logger('INFO', req.method, 200, req, user);
							}
						});
					}
				});
			} else {
				res.sendStatus(403); // 403 Forbidden
				utils.logger('WARNING', req.method, 403, req, user);
			}
		});	
	})

	/**
	 * DELETE /stations/:MAC
	 * Authorization required. Username and password encoded with Base64.
	 * Privilege level required: 0.
	 * 200 OK						Station deleted successfully.
	 * 401 Unauthorized				Missing authorization header or unsuccessful login.
	 * 403 Forbidden				Successful login but not enough privileges to perform the action.
	 * 404 Not Found				The specified user doesn't exist.
	 * 500 Internal Server Error	Failure in database query.
	 */
	.delete(function(req, res) {
		utils.login(req, res, function(user) {
			if (utils.validateUserPrivileges(user, [0])) {
				User.Station.findOne({'_type': 'Station', 'login' : req.params.MAC}, function(err, station) {
					if (err) {
						res.sendStatus(500); // 500 Internal Server Error
						utils.logger('ERROR', req.method, 500, req, user);
					}
					else
						if (station == null) {
							res.sendStatus(404); // 404 Not Found
							utils.logger('INFO', req.method, 404, req, user);
						}
						else {
							station.remove();
							res.send({message: 'Station deleted!'}); // 200 OK
							utils.logger('INFO', req.method, 200, req, user);
						}
				});
			} else {
				res.sendStatus(403); // 403 Forbidden
				utils.logger('WARNING', req.method, 403, req, user);
			}
		});
	});

router.route('/stations/:MAC/data')
	/**
	 * GET /stations/:MAC/data
	 * Authorization required. Username and password encoded with Base64.
	 * Privilege level required: 0 or 1.
	 * 200 OK						Sample collection for the specified station is sended.
	 * 401 Unauthorized				Missing authorization header or unsuccessful login.
	 * 403 Forbidden				Successful login but not enough privileges to perform the action.
	 * 404 Not Found				Station not found.
	 * 500 Internal Server Error	Failure in database query.
	 */
	.get(function(req, res){
		utils.login(req, res, function(user) {
			if (utils.validateUserPrivileges(user, [0, 1])) {
				utils.stationExists(req.params.MAC, function(exists, station) {
					if (exists) {
						Sample.find({'MAC' : req.params.MAC}, function(err, samples) {
							if (err) {
								res.sendStatus(500); // 500 Internal Server Error
								utils.logger('ERROR', req.method, 500, req, user);
							}
							else {
								res.send(samples); // 200 OK
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
	})

	/**
	 * POST /stations/:MAC/data
	 * Authorization required. Username and password encoded with Base64.
	 * Privilege level required: 2.
	 * 201 Created					Sample added successfully.
	 * 400 Bad Request				Bad format.
	 * 401 Unauthorized				Missing authorization header or unsuccessful login.
	 * 403 Forbidden				Successful login but not enough privileges to perform the action. Owner!
	 * 404 Not found 				Station not found.
	 */
	.post(function(req, res) {
		utils.login(req, res, function(user) {
			if (utils.validateUserPrivileges(user, [2])) {
				utils.stationExists(req.params.MAC, function(exists, station) {
					if (exists) {
						if (user.login === station.login) {
							var sample = new Sample(req.body);
							if (sample.MAC != null && sample.MAC === station.login) {
								sample.save(function(err) {
									if (err) {
										res.status(400).send(err); // 400 Bad Request
										utils.logger('INFO', req.method, 400, req, user);
									}
									else {
										res.status(201).send({message: 'Sample added'}); // 201 Created
										utils.logger('INFO', req.method, 201, req, user);
									}
								});
							} else {
								res.sendStatus(400); // 400 Bad Request
								utils.logger('INFO', req.method, 400, req, user);
							}
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
	});

router.route('/stations/:MAC/data/:id')
	/**
	 * GET /stations/:MAC/data/:id
	 * Authorization required. Username and password encoded with Base64.
	 * Privilege level required: 0 or 1.
	 * 200 OK						Sample docuement for the specified station.
	 * 401 Unauthorized				Missing authorization header or unsuccessful login.
	 * 403 Forbidden				Successful login but not enough privileges to perform the action.
	 * 404 Not Found				Station not found.
	 */
	.get(function(req, res){
		utils.login(req, res, function(user) {
			if (utils.validateUserPrivileges(user, [0, 1])) {
				utils.stationExists(req.params.MAC, function(exists, station) {
					if (exists) {
						Sample.findOne({'_id' : req.params.id}, function(err, sample) {
							if (err || sample == null || sample == []) {
								res.sendStatus(404); // 404 Not Found
								utils.logger('INFO', req.method, 404, req, user);
							} else {
								res.send(sample); // 200 OK
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

router.route('/stations/:MAC/data/:id')
	/**
	 * GET /stations/:MAC/data/:id
	 * Authorization required. Username and password encoded with Base64.
	 * Privilege level required: 0.
	 * 200 OK						Sample docuement has been deleted.
	 * 401 Unauthorized				Missing authorization header or unsuccessful login.
	 * 403 Forbidden				Successful login but not enough privileges to perform the action.
	 * 404 Not Found				Station not found.
	 */
	.delete(function(req, res){
		utils.login(req, res, function(user) {
			if (utils.validateUserPrivileges(user, [0])) {
				utils.stationExists(req.params.MAC, function(exists, station) {
					if (exists) {
						Sample.findOne({'_id' : req.params.id}, function(err, sample) {
							if (err || sample == null || sample == []) {
								res.sendStatus(404); // 404 Not Found
								utils.logger('INFO', req.method, 404, req, user);
							} else {
								sample.remove();
								res.send({message: 'Sample deleted!'}); // 200 OK
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