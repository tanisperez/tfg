var auth = require('http-auth');
var User = require('../../models/v1/user')
var utils = require('./utils');

var console = process.console;

var logAuth = auth.basic({
        realm: "Admin area"
    }, function (username, password, callback) {
        User.Person
            .findOne({'login' : username, 'password' : password})
            .populate({path: 'groups'})
            .exec(function (err, user) {
    			if (user == null || !utils.validateUserPrivileges(user, [0])) {
    				console.tag('WARNING', 'LOG').log('Access denied to ' + username);
    				callback(false);
    			} else {
                    //console.tag('INFO', 'LOG').log('Access granted to ' + username);
                    callback(true);
    			}
    	});
    }
);

module.exports = logAuth;