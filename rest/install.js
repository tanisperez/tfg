var mongoose = require('mongoose');
var Group = require('./models/v1/group');
var User = require('./models/v1/user');
var config = require('./config');

var connectionString = 'mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name.release;

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
													'login' : '08002857A267',
													'password' : '762A75820080',
													'groups' : [{
														'_id' : stationsGroup._id,
													}],
													'data' : {
														'location' : 'localhost',
														'wifi' : 'moto',
														'wifiPassword' : 'motomoto',
														'ip' : '10.68.34.218',
														'port' : 3000,
														'interval' : 16
													}
												});
												station.save(function (err){
													if (err)
														console.log('Couldn\'t create the station user!');
													else {
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
															else
																console.log('Regular user created!');
															process.exit(0);
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
