const User = require('../models/user');
// const WatchList = require('../models/watchList');
const { isEmail, oneLowercaseChar, oneUppercaseChar, oneNumber, oneSpecialChar, notEmpty, isMasternodeAddress } = require('../middlewares/cusotomValidator.js');
const { balancePinner, totalBalanceCounter } = require('../services/balancePinner.js');
const { watchlistTagCounter } = require('../services/counters.js');
const TOKEN_LIFE = +process.env.token_life;
const { ERROR_NO_USER, ERROR_TOKEN_LIFETIME_IS_OVER, WATCHLIST_ADDRESS_ALREADY_EXIST, INVALID_NOTIFICATION_STATUS, INVALID_NOTIFICATION_DESTINATION, OFF, ALL, ONLY_INCOMING, INTERNAL, EMAIL, ONLY_OUTGOING, ERROR_WRONG_ADDRESS, WATCHLIST_ADDRESS_NOT_PROVIDED, WATCHLIST_ADDRESS_NOT_FOUND, CURRENCY_NOT_PROVIDED, INVALID_CURRENCY,SEND_LIMIT_EXCEEDED, btcu_testnet, btcu } = require('../const/const.js');
const { paginateData } = require('../services/paginateData');
const { filterWatchListByCurrency } = require('../services/filterWatchListByCurrency');
// setInterval(() => {
// 	watchlistAddressGetter(); // had to started from server.js
// }, 3000);
// exports.index = async function (req, res) {
// 	const users = await WatchList.find({});
// 	res.status(200).json({ users });
// };

exports.addToWatchList = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });
		if (isMasternodeAddress(req.body.address)) return res.status(500).json({ message: ERROR_WRONG_ADDRESS });
		if (!req.body.address) return res.status(500).json({ message: WATCHLIST_ADDRESS_NOT_PROVIDED });
		let currency = req.body.currency;
		if (!currency ) return res.status(500).json({ message: CURRENCY_NOT_PROVIDED});
		else if (currency && currency !== btcu && currency !== btcu_testnet) {
			return res.status(500).json({ message: INVALID_CURRENCY });
		}
		let isAddressExist = () => {
			for (const iterator of user.watchList) {
				if (iterator.address === req.body.address && iterator.currency === req.body.currency) return true;
			}
		};
		if (isAddressExist()) return res.status(500).json({ message: WATCHLIST_ADDRESS_ALREADY_EXIST });

		let notificationStatus = req.body.notificationStatus;
		if (!notificationStatus) notificationStatus = OFF;
		if (notificationStatus && notificationStatus !== OFF && notificationStatus !== ONLY_INCOMING && notificationStatus !== ONLY_OUTGOING && notificationStatus !== ALL) {
			return res.status(500).json({ message: INVALID_NOTIFICATION_STATUS });
		}

		let notificationDestination = req.body.notificationDestination;
		if (!notificationDestination || notificationStatus === OFF) notificationDestination = OFF;
		else if (notificationDestination && notificationDestination !== OFF && notificationDestination !== INTERNAL && notificationDestination !== EMAIL && notificationDestination !== ALL) {
			return res.status(500).json({ message: INVALID_NOTIFICATION_DESTINATION });
		}

		if(user.watchList.length  >= user.maxWatchListCount) return res.status(500).json({ message: SEND_LIMIT_EXCEEDED });
		let watchListObject = {
			address: req.body.address,
			notificationStatus,
			notificationDestination,
			currency,
			description: `${req.body.description ? (description = req.body.description.slice(0, 75)) : (description = '')}`,
			tag: `${req.body.tag ? (tag = req.body.tag.slice(0, 25)) : (tag = '')}`,
			createdAt: Date.now(),
		};
		await user.watchList.addToSet(watchListObject);
		await user.save();
		const userNew = await User.findOne({ token });
		return res.status(200).json({
			watchList: userNew.watchList,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

// @route PUT api/user/watchList
// @desc Update user details
// @access Public
exports.updateWatchListAddress = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });
		if (!req.body.address) return res.status(500).json({ message: WATCHLIST_ADDRESS_NOT_PROVIDED });
		if (isMasternodeAddress(req.body.address)) return res.status(500).json({ message: ERROR_WRONG_ADDRESS });

		let currency = req.body.currency;
		if (!currency ) return res.status(500).json({ message: CURRENCY_NOT_PROVIDED});
		else if (currency && currency !== btcu && currency !== btcu_testnet) {
			return res.status(500).json({ message: INVALID_CURRENCY });
		}
		let isAddressExist = () => {
			for (const iterator of user.watchList) {
				if (iterator.address === req.body.address && iterator.currency === req.body.currency) return true;
			}
		};
		if (!isAddressExist()) return res.status(500).json({ message: WATCHLIST_ADDRESS_NOT_FOUND });

		let notificationStatus = req.body.notificationStatus;
		if (!notificationStatus) notificationStatus = OFF;
		if (notificationStatus && notificationStatus !== OFF && notificationStatus !== ONLY_INCOMING && notificationStatus !== ONLY_OUTGOING && notificationStatus !== ALL) {
			return res.status(500).json({ message: INVALID_NOTIFICATION_STATUS });
		}

		let notificationDestination = req.body.notificationDestination;
		if (!notificationDestination || notificationStatus === OFF) notificationDestination = OFF;
		else if (notificationDestination && notificationDestination !== OFF && notificationDestination !== INTERNAL && notificationDestination !== EMAIL && notificationDestination !== ALL) {
			return res.status(500).json({ message: INVALID_NOTIFICATION_DESTINATION });
		}

		let watchListObject = {
			// address: req.body.address,
			notificationStatus,
			currency,
			notificationDestination,
			description: `${req.body.description ? (description = req.body.description.slice(0, 75)) : (description = '')}`,
			tag: `${req.body.tag ? (tag = req.body.tag.slice(0, 25)) : (tag = '')}`,
		};
		let updatedUser = await User.findOneAndUpdate({ token, 'watchList.address': req.body.address }, { $set: { 'watchList.$.notificationStatus': notificationStatus, 'watchList.$.notificationDestination': notificationDestination, 'watchList.$.tag': watchListObject.tag, 'watchList.$.description': watchListObject.description, 'watchList.$.currency': watchListObject.currency  } }, { new: true });
		return res.status(200).json({
			watchList: updatedUser.watchList,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

// @route GET api/user/watchList
// @desc GET user watchList addresses
// @access Public
exports.getWatchListForUser = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) {
			return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });
		}
		let currency = req.params.currency;
		const watchListWithCurrency = await filterWatchListByCurrency(user.watchList, currency)
		await balancePinner(watchListWithCurrency, currency); //pin balance for each user.watchlist
		let totalTags = watchlistTagCounter(watchListWithCurrency);
		let totalBalance = await totalBalanceCounter(watchListWithCurrency);
		let watchListArr = await paginateData(
			req,
			res,
			watchListWithCurrency.sort((a, b) => b.createdAt - a.createdAt)
		);
		watchListArr.grandTotal = totalBalance.grandTotal;
		watchListArr.grandTotalUSD = totalBalance.grandTotalUSD;
		watchListArr.totalTags = totalTags;
		watchListArr.maxWatchListCount = user.maxWatchListCount;
		return res.status(200).json({
			watchListArr,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

// @route DELETE api/user/watchList
// @desc DELTE user watchList address
// @access Public
exports.deleteWatchListAddress = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });
		if (!req.body.address) return res.status(500).json({ message: WATCHLIST_ADDRESS_NOT_PROVIDED });

		let currency = req.body.currency;
		if (!currency ) return res.status(500).json({ message: CURRENCY_NOT_PROVIDED});
		else if (currency && currency !== btcu && currency !== btcu_testnet) {
			return res.status(500).json({ message: INVALID_CURRENCY });
		}
		let isAddressExist = () => {
			for (const iterator of user.watchList) {
				if (iterator.address === req.body.address && iterator.currency === req.body.currency) return true;
			}
		};
		if (!isAddressExist()) return res.status(500).json({ message: WATCHLIST_ADDRESS_NOT_FOUND });


		let userNew = await User.findOneAndUpdate({ token, ['watchList.address']: req.body.address, ['watchList.currency']: req.body.currency,}, { $pull: { watchList: { address: req.body.address, currency: req.body.currency } } }, { new: true });
		return res.status(200).json({
			watchList: userNew.watchList,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};


// exports.updateMaxWatchListCount = async function (req, res) {       //TODO IF NEEDED
// 	try {
// 	} catch (error) {
// 		res.status(500).json({ message: error.message });
//	}
//};
