const mongoose = require('mongoose');
const { btcu } = require('../const/const');

const watchListTransactions = new mongoose.Schema({
	token: {
		type: String,
		required: false,
		default: '',
		max: 600,
	},
	address: {
		type: String,
		required: false,
		// unique: true, //test ! change to true
		max: 100,
	},

	email: {
		type: String,
		required: false,
		unique: false,
		capped: true,
		size: 30,
		max: 30,
	},

	name: {
		type: String,
		required: false,
		unique: false,
	},

	currency: {
		type: String,
		required: true,
		// default: btcu,
		unique: false,
	},

	transactionType: {
		type: String,
		required: true,
		unique: false,
	},

	notificationStatus: {
		type: String,
		required: false,
		unique: false,
		max: 20,
	},

	txHash: {
		type: String,
		required: false,
		unique: false,
	},

	notificationDestination: {
		type: String,
		required: false,
		unique: false,
		max: 20,
	},

	addressSent: {
		type: Array,
		required: false,
		default: [],
		// max: 200,
	},

	addressReceived: {
		type: Array,
		required: false,
		default: [],
		// max: 200,
	},

	value: {
		type: Number,
		required: true,
		default: 0,
		// max: 200,
	},
	timestamp: {
		type: Number,
		required: true,
		// default: 0,
		// max: 200,
	},
	read: {
		type: Boolean,
		// required: true,
		default: false,
		// max: 200,
	},

	// createdAt: {
	// 	type: Date,
	// 	required: true,
	// 	default: Date.now,
	// 	// expires: 43200
	// 	// expires: 60 // changed
	// },

	// updatedAt: {
	// 	type: Date,
	// 	required: true,
	// 	default: Date.now,
	// 	// expires: 43200
	// 	// expires: 60 // changed
	// },
});

module.exports = mongoose.model('watchListTransactions', watchListTransactions);
