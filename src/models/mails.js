const mongoose = require('mongoose');

const mails = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		max: 200,
	},
	type: {
		type: String,
		required: true,
		max: 50,
	},
	isVerified: {
		type: Boolean,
		default: false,
	},
	timestamp: {
		type: Number,
		required: true,
		default: Date.now(),
		// max: 200,
	},
});

module.exports = mongoose.model('mails', mails);
