require('dotenv').config();
const WatchListTransactions = require('../models/watchListTransactions');
const User = require('../models/user');
const { isEmail, oneLowercaseChar, oneUppercaseChar, oneNumber, oneSpecialChar, notEmpty, isMasternodeAddress } = require('../middlewares/cusotomValidator.js');
const {
	ERROR_NO_USER,
	ERROR_ACCESS_TOKEN_EXPIRED,
	WATCHLIST_ADDRESS_ALREADY_EXIST,
	INVALID_NOTIFICATION_STATUS,
	INVALID_NOTIFICATION_DESTINATION,
	OFF,
	ALL,
	ONLY_INCOMING,
	INTERNAL,
	EMAIL,
	ONLY_OUTGOING,
	ERROR_WRONG_ADDRESS,
	WATCHLIST_ADDRESS_NOT_PROVIDED,
	WATCHLIST_ADDRESS_NOT_FOUND,
	INVALID_CURRENCY,
	NOTIFY_NOT_FOUND,
	btcu,
	btcu_testnet,
} = require('../const/const.js');
// if (process.env.ENVIRONMENT === 'development') {
// } else process.env.token_life = 43200000;

// @route GET api/user/watchList
// @desc GET user watchList addresses
// @access Public
exports.getLastNotification = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > process.env.token_life) {
			return res.status(401).json({ message: ERROR_ACCESS_TOKEN_EXPIRED });
		}
		email = user.email;
		let currency = req.params.currency
		if(currency !== btcu && currency !== btcu_testnet) return res.status(401).json({ message: INVALID_CURRENCY });
		if(currency === btcu ) currency = "Mainnet"
		if(currency === btcu_testnet ) currency = "Orion"
		let txes = await WatchListTransactions.find({ email, currency }).limit(20).sort({timestamp: -1});
		let txArr = [];
		for (const iterator of txes) {
			txArr.push({
				sender: iterator.addressSent,
				recipient: iterator.addressReceived,
				totalOutput: iterator.value,
				currency: iterator.currency,
				read: iterator.read,
				timestamp: iterator.timestamp,
				transactionType: iterator.transactionType,
				txHash: iterator.txHash,
				id: iterator._id,
			});
		}
		return res.status(200).json({
			txNotifications: {
				readed: 0,
				notifications: txArr,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

// @route GET api/user/watchList
// @desc GET user watchList addresses
// @access Public
exports.deleteOnetNotification = async function (req, res) {
	try {
		let token = req.headers.authorization;
		let _id = req.body.id;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > process.env.token_life) {
			return res.status(401).json({ message: ERROR_ACCESS_TOKEN_EXPIRED });
		}
		email = user.email;
		let deleted = await WatchListTransactions.deleteOne({ _id });
		if (deleted.n == 0) return res.status(500).json({ message: NOTIFY_NOT_FOUND });
		let txes = await WatchListTransactions.find({ email }).limit(20).sort({timestamp: -1});
		// console.log('txes.length ', txes.length);

		let txArr = [];
		for (const iterator of txes) {
			txArr.push({
				sender: iterator.addressSent,
				recipient: iterator.addressReceived,
				totalOutput: iterator.value,
				read: iterator.read,
				currency: iterator.currency,
				timestamp: iterator.timestamp,
				transactionType: iterator.transactionType,
				txHash: iterator.txHash,
				id: iterator._id,
			});
		}
		return res.status(200).json({
			txNotifications: {
				readed: 0,
				notifications: txArr,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};
