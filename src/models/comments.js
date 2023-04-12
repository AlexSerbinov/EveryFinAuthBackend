const mongoose = require('mongoose');

const comments = new mongoose.Schema({
	commentId: {
		type: String,
		required: true,
		max: 100,
	},
	userId: {
		type: String,
		required: true,
		max: 100,
	},

	repliedToId: {
		type: String,
		default: '',
		max: 100,
	},

	name: {
		type: String,
		required: false,
		unique: false,
	},
	avatar: {
		type: String,
		required: false,
		unique: false,
	},
	currency: {
		type: String,
		required: true,
		max: 100,
	},

	blockchainData: {
		type: String,
		required: true,
		unique: false,
	},

	comment: {
		type: String,
		required: true,
		max: 5000,
	},
	timestamp: {
		type: Number,
		required: true,
		default: Date.now(),
		// max: 200,
	},
});

module.exports = mongoose.model('comments', comments);
