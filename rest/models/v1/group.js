var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Group = new Schema({
	groupName: {type: String, trim: true, unique: true, index: true, required: true},
	privilegeLevel: {type: Number, min: 0, required: true},
	__v: {type: Number, select: false}
});

module.exports = mongoose.model('Group', Group, 'groups');