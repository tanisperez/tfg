var http = require('http');

/**
 * 
 *
 */
exports.login = function(user, password, callback) {
	var req = http.request({
		hostname: 'localhost',
		port: 3000,
		path: '/v1/login',
		method: 'GET',
		auth: user + ':' + password
	}, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
		callback(res.statusCode, chunk);
		});
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	// write data to request body
	//req.write(postData);
	req.end();
}

exports.users = function(user, password, callback) {
	var req = http.request({
		hostname: 'localhost',
		port: 3000,
		path: '/v1/users',
		method: 'GET',
		auth: user + ':' + password
	}, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
		callback(res.statusCode, chunk);
		});
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	req.end();
}

exports.addUser = function(user, password, newUser, callback) {
	var body = JSON.stringify(newUser);
	var req = http.request({
		hostname: 'localhost',
		port: 3000,
		path: '/v1/users',
		method: 'POST',
		auth: user + ':' + password,
		headers: {
	        "Content-Type": "application/json",
	        "Content-Length": Buffer.byteLength(body)
    	}
	}, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			callback(res.statusCode, chunk);
		});
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	req.end(body);
}

exports.deleteUser = function(user, password, userToDelete, callback) {
	var req = http.request({
		hostname: 'localhost',
		port: 3000,
		path: '/v1/users/' + userToDelete,
		method: 'DELETE',
		auth: user + ':' + password
	}, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			callback(res.statusCode, chunk);
		});
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	req.end();
}

exports.groups = function(user, password, callback) {
	var req = http.request({
		hostname: 'localhost',
		port: 3000,
		path: '/v1/groups',
		method: 'GET',
		auth: user + ':' + password
	}, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			callback(res.statusCode, chunk);
		});
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	req.end();
}

exports.usersInGroup = function(user, password, groupName, callback) {
	var req = http.request({
		hostname: 'localhost',
		port: 3000,
		path: '/v1/groups/' + groupName + '/users',
		method: 'GET',
		auth: user + ':' + password
	}, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			var json = JSON.parse(chunk);
			callback(res.statusCode, JSON.stringify(json));
		});
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	req.end();
}

exports.stations = function(user, password, callback) {
	var req = http.request({
		hostname: 'localhost',
		port: 3000,
		path: '/v1/stations',
		method: 'GET',
		auth: user + ':' + password
	}, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			callback(res.statusCode, chunk);
		});
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	req.end();
}

exports.getStation = function(user, password, MAC, callback) {
	var req = http.request({
		hostname: 'localhost',
		port: 3000,
		path: '/v1/stations/' + MAC,
		method: 'GET',
		auth: user + ':' + password
	}, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			callback(res.statusCode, chunk);
		});
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	req.end();
}

exports.deleteStation = function(user, password, MAC, callback) {
	var req = http.request({
		hostname: 'localhost',
		port: 3000,
		path: '/v1/stations/' + MAC,
		method: 'DELETE',
		auth: user + ':' + password
	}, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			callback(res.statusCode, chunk);
		});
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	req.end();
}

exports.getStationData = function(user, password, MAC, callback) {
	var req = http.request({
		hostname: 'localhost',
		port: 3000,
		path: '/v1/stations/' + MAC + '/data/',
		method: 'GET',
		auth: user + ':' + password
	}, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			callback(res.statusCode, chunk);
		});
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	req.end();
}

exports.deleteStationData = function(user, password, MAC, dataId, callback) {
	var req = http.request({
		hostname: 'localhost',
		port: 3000,
		path: '/v1/stations/' + MAC + '/data/' + dataId,
		method: 'DELETE',
		auth: user + ':' + password
	}, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			callback(res.statusCode, chunk);
		});
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	req.end();	
}

exports.addStation = function(user, password, station, callback) {
	var body = JSON.stringify(station);
	var req = http.request({
		hostname: 'localhost',
		port: 3000,
		path: '/v1/stations',
		method: 'POST',
		auth: user + ':' + password,
		headers: {
	        "Content-Type": "application/json",
	        "Content-Length": Buffer.byteLength(body)
    	}
	}, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			callback(res.statusCode, chunk);
		});
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	req.end(body);
}

exports.updateStationSettings = function(user, password, station, stationSettings, callback) {
	var body = JSON.stringify(stationSettings);
	var req = http.request({
		hostname: 'localhost',
		port: 3000,
		path: '/v1/stations/' + station,
		method: 'PUT',
		auth: user + ':' + password,
		headers: {
	        "Content-Type": "application/json",
	        "Content-Length": Buffer.byteLength(body)
    	}
	}, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			callback(res.statusCode, chunk);
		});
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	req.end(body);
}