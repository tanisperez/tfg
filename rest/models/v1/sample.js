var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Sample = new Schema({
	MAC: {type: String, trim: true, required: true},
	sampleDate: {type: Date, default: Date.now, required: true},
	samples: [],
	__v: {type: Number, select: false}
});

module.exports = mongoose.model('Sample', Sample, 'samples');