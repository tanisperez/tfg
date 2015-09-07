var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	_type: {type: String, required: true},
	login: {type: String, unique: true, index: true, trim: true, required: true},
	password: {type: String, required: true},
	groups: [{
		type: Schema.ObjectId,
		ref: 'Group',
		required: true
	}],
	data: {type: String, required: true},
	__v: {type: Number, select: false}
});

var Person = new Schema({
	_type: {type: String, default: 'Person'},
	login: {type: String, unique: true, index: true, trim: true, required: true},
	password: {type: String, required: true},
	groups: [{
		type: Schema.ObjectId,
		ref: 'Group',
		required: true
	}],
	data: {
		name: {type: String, trim: true, required: true},
		secondName: {type: String, trim: true, required: true},
		dateOfBirth: {type: Date, required: true}
	},
	__v: {type: Number, select: false}
});

var Station = new Schema({
	_type : {type: String, default: 'Station'},
	login: {type: String, unique: true, index: true, trim: true, required: true},
	password: {type: String, required: true},
	groups: [{
		type: Schema.ObjectId,
		ref: 'Group',
		required: true
	}],
	data: {
		location: {type: String, trim: true, required: true},
		dateOfRegistration: { type: Date, default: Date.now, required: true},
		wifi: {type: String, trim: true, required: false},
		wifiPassword: {type: String, trim: true, required: false},
		ip: {type: String, trim: true, required: true},
		port: {type: Number, required: true},
		interval: {type: Number, required: true}
	},
	__v: {type: Number, select: false}
});


User.methods.type = function() { return 'User'; };
Person.methods.type = function() { return 'Person'; };
Station.methods.type = function() { return 'Station'; };

var User = mongoose.model('User', User, 'users');
var exports = module.exports = User;
User.Person = mongoose.model('Person', Person, 'users');
User.Station = mongoose.model('Station', Station, 'users');

/** Validators */
User.schema.path('groups').validate(function (value) {
  if (value == null ||value.length == 0)
  	return false;
  else
  	return true;
}, 'At lest one group is required!');

User.Person.schema.path('groups').validate(function (value) {
  if (value == null ||value.length == 0)
  	return false;
  else
  	return true;
}, 'At lest one group is required!');

User.Station.schema.path('groups').validate(function (value) {
  if (value == null ||value.length == 0)
  	return false;
  else
  	return true;
}, 'At lest one group is required!');

User.Person.schema.path('_type').validate(function (value) {
	return (value === 'Person');
});

User.Station.schema.path('_type').validate(function (value) {
	return (value === 'Station');
});

User.Station.schema.path('data.ip').validate(function (value) {
	return (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(value));
}, 'restIP must be a valid IPv4 (0-255.0-255.0-255.0-255)!');

User.Station.schema.path('data.port').validate(function (value) {
	return (value > 0 && value < 65536);
}, 'restPort must be between 1-65535');

// Poner un mínimo y mayor que 0!!!!!
User.Station.schema.path('data.interval').validate(function (value) {
	return !(value % 8);
}, 'samplesInterval must be multiple of 8');


/** Glue code */
var init = User.prototype.init;
init.Person = new User.Person().__proto__;
init.Station = new User.Station().__proto__;
User.prototype.init = function (doc, fn) {
	var obj = init.apply(this, arguments);
	obj.__proto__ = init[doc._type];
	return obj;
};