var mongoose = require('mongoose');
var Group = require('./models/v1/group');
var User = require('./models/v1/user');
var Sample = require('./models/v1/sample');
var config = require('./config');

var connectionString = 'mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name.testing;

mongoose.connect(connectionString, function(err) {
	if (err)
		throw err;
	else {
		console.log('Connected to ' + connectionString);

		mongoose.connection.db.dropDatabase(function (err) {
			if (err)
				console.log('Couldn\'t drop the database!');
			else {
				console.log('Collection dropped!\n');

				var adminGroup = new Group({'groupName' : 'Admin', 'privilegeLevel' : 0});
				adminGroup.save(function (err) {
					if (err)
						console.log('Couldn\'t create Admin group!');
					else {
						console.log('Admin group created');
						var admin = new User.Person({
							'login' : 'admin',
							'password' : 'admin',
							'groups' : [{
								'_id' : adminGroup._id,
							}],
							'data' : {
								'name' : 'Administrador',
								'secondName' : 'Root',
								'dateOfBirth' : '1970-01-01 00:00:01'
							}
						});
						admin.save(function (err) {
							if (err) {
								console.log('Couldn\'t create the admin user!');
								throw err;
							} else {
								var usersGroup = new Group({'groupName' : 'User', 'privilegeLevel' : 1});
								usersGroup.save(function (err) {
									if (err)
										console.log('Couldn\'t create the users group!');
									else {
										console.log('Users group created');
										var stationsGroup = new Group({'groupName' : 'Station', 'privilegeLevel' : 2});
										stationsGroup.save(function (err) {
											if (err)
												console.log('Couldn\'t create the stations group!');
											else {
												console.log('Stations group created');
												var station = new User.Station({
													'login' : 'station',
													'password' : 'station',
													'groups' : [{
														'_id' : stationsGroup._id,
													}],
													'data' : {
														'location' : 'localhost',
														'wifi' : 'R-wlan2B',
														'wifiPassword' : 'lagafadeoro',
														'ip' : '192.168.0.16',
														'port' : 3000,
														'interval' : 16
													}
												});
												station.save(function (err){
													if (err) {
														throw err;
														console.log('Couldn\'t create the station user!');
													} else {
														console.log('Station user created!');
														var user = new User.Person({
															'login' : 'user',
															'password' : 'user',
															'groups' : [{
																'_id' : usersGroup._id,
															}],
															'data' : {
																'name' : 'User',
																'secondName' : 'Pepe',
																'dateOfBirth' : '1970-01-01 00:00:01'
															}
														});
														user.save(function (err) {
															if (err)
																console.log('Couldn\'t create the regular user!');
															else {
																console.log('Regular user created!');
																var user2 = new User.Person({
																	'login' : 'user2',
																	'password' : 'user2',
																	'groups' : [{
																		'_id' : usersGroup._id,
																	}],
																	'data' : {
																		'name' : 'User2',
																		'secondName' : 'Pepe',
																		'dateOfBirth' : '1970-01-01 00:00:01'
																	}
																});
																user2.save(function (err) {
																	if (err)
																		console.log('Couldn\'t create the user2!');
																	else {
																		console.log('User 2 created!');
																		var station2 = new User.Station({
																			'login' : 'station2',
																			'password' : 'station2',
																			'groups' : [{
																				'_id' : stationsGroup._id,
																			}],
																			'data' : {
																				'location' : 'localhost',
																				'wifi' : 'R-wlan2B',
																				'wifiPassword' : 'lagafadeoro',
																				'ip' : '192.168.0.16',
																				'port' : 3000,
																				'interval' : 16
																			}
																		});
																		station2.save(function(err) {
																			if (err)
																				console.log('Couldn\'t create the station2!');
																			else {
																				console.log('Station2 created!');
																				var admin2 = new User.Person({
																						'login' : 'admin2',
																						'password' : 'admin2',
																						'groups' : [{
																							'_id' : adminGroup._id,
																						}],
																						'data' : {
																							'name' : 'Administrador',
																							'secondName' : 'Root',
																							'dateOfBirth' : '1970-01-01 00:00:01'
																						}
																					});
																				admin2.save(function(err) {
																					if (err)
																						console.log('Couldn\'t create the admin2!');
																					else {
																						console.log('Admin2 created!');
																						var sample = new Sample({
																							'MAC': 'station',
																							'samples' : [
																								{'temperature': '25º C',
																								'humidity': '75%'}	
																							]
																						});
																						sample.save(function (err) {
																							if (err)
																								console.log('Couldn\'t add the sample!');
																							else {
																								console.log('Sample added!');
																								var sample2 = new Sample({
																									'MAC': 'station',
																									'samples' : [
																										{'temperature': '29º C',
																										'humidity': '82%'}	
																									]
																								});
																								sample2.save(function(err) {
																									if (err) 
																										console.log('Couldn\'t add the sample 2!');
																									else {
																										console.log('Sample 2 added!');
																										var sample3 = new Sample({
																											'MAC': 'station2',
																											'samples' : [
																												{'temperature': '19º C'}	
																											]
																										});
																										sample3.save(function(err) {
																											if (err)
																												console.log('Couldn\'t add the sample 3!');
																											else {
																												console.log('Sample 3 added!');
																												process.exit(0);
																											}
																										});
																									}
																								});
																							}
																						})
																					}
																				});
																			}
																		});
																	}
																});
															}
														});
													}
												});
											}
										});
									}
								});
							}
						});
					}
				});
			}
		});
	}
});
