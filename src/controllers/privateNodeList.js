const User = require('../models/user');
// const PrivateNodeList = require('../models/privateNodeList');
const { isEmail, oneLowercaseChar, oneUppercaseChar, oneNumber, oneSpecialChar, notEmpty, isMasternodeAddress, isTxHash } = require('../middlewares/cusotomValidator.js');
const { balancePinner, totalBalanceCounter } = require('../services/balancePinner.js');
const TOKEN_LIFE = +process.env.token_life;
const { ERROR_NO_USER, ERROR_TOKEN_LIFETIME_IS_OVER, TX_HASH_ALREADY_EXIST, TX_HASH_NOT_PROVIDED, TX_HASH_NOT_FOUND, ERROR_WRONG_TX_HASH,CURRENCY_NOT_PROVIDED, INVALID_CURRENCY,SEND_LIMIT_EXCEEDED, btcu, btcu_testnet } = require('../const/const.js');
const { paginateData } = require('../services/paginateData');
const { filterWatchListByCurrency } = require('../services/filterWatchListByCurrency');

// exports.index = async function (req, res) {
// 	const users = await PrivateNodeList.find({});
// 	res.status(200).json({ users });
// };

exports.addToPrivateNodeList = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });
		if (isTxHash(req.body.txHash)) return res.status(500).json({ message: ERROR_WRONG_TX_HASH }); // регулярка для входящей транзакции
		if (!req.body.txHash) return res.status(500).json({ message: TX_HASH_NOT_PROVIDED });
		
		let currency = req.body.currency;
		if (!currency ) return res.status(500).json({ message: CURRENCY_NOT_PROVIDED});
		else if (currency && currency !== btcu && currency !== btcu_testnet) {
			return res.status(500).json({ message: INVALID_CURRENCY });
		}
		let isAddressExist = () => {
			for (const iterator of user.privateNodeList) {
				if (iterator.txHash === req.body.txHash && iterator.currency === req.body.currency) return true;
			}
		};
		if (isAddressExist()) return res.status(500).json({ message: TX_HASH_ALREADY_EXIST });
		if(user.privateNodeList.length  >= user.maxWatchListCount) return res.status(500).json({ message: SEND_LIMIT_EXCEEDED });

		let privateNodeListObject = {
			txHash: req.body.txHash,
			currency,
			description: `${req.body.description ? (description = req.body.description.slice(0, 75)) : (description = '')}`,
			createdAt: Date.now(),
		};
		await user.privateNodeList.addToSet(privateNodeListObject);
		await user.save();
		const userNew = await User.findOne({ token });
		const privateNodeListWithCurrency = await filterWatchListByCurrency(userNew.privateNodeList, currency)

		return res.status(200).json({
			privateNodeList: privateNodeListWithCurrency,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

// @route PUT api/user/privateNodeList
// @desc Update user details
// @access Public
exports.updatePrivateNodeListAddress = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });
		if (!req.body.txHash) return res.status(500).json({ message: TX_HASH_NOT_PROVIDED });
		// if (isMasternodeAddress(req.body.txHash)) return res.status(500).json({ message: ERROR_WRONG_TX_HASH });  регулярка на тх хэщ!

		let currency = req.body.currency;
		if (!currency ) return res.status(500).json({ message: CURRENCY_NOT_PROVIDED});
		else if (currency && currency !== btcu && currency !== btcu_testnet) {
			return res.status(500).json({ message: INVALID_CURRENCY });
		}

		let isAddressExist = () => {
			for (const iterator of user.privateNodeList) {
				if (iterator.txHash === req.body.txHash && iterator.currency === req.body.currency) return true;
			}
		};
		if (!isAddressExist()) return res.status(500).json({ message: TX_HASH_NOT_FOUND });
		let privateNodeListObject = {
			// txHash: req.body.txHash,
			currency,
			description: `${req.body.description ? (description = req.body.description.slice(0, 75)) : (description = '')}`,
		};

		let updatedUser = await User.findOneAndUpdate({ token, 'privateNodeList.txHash': req.body.txHash, 'privateNodeList.currency': req.body.currency  }, { $set: { 'privateNodeList.$.description': privateNodeListObject.description } }, { new: true });
		const privateNodeListWithCurrency = await filterWatchListByCurrency(updatedUser.privateNodeList, currency)
		return res.status(200).json({
			privateNodeList: privateNodeListWithCurrency,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

// @route GET api/user/privateNodeList
// @desc GET user privateNodeList txHashes
// @access Public
exports.getPrivateNodeListForUser = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) {
			return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });
		}
		let currency = req.params.currency;
		const privateNodeListWithCurrency = await filterWatchListByCurrency(user.privateNodeList, currency)
		let privateNodeListArr = await paginateData(
			req,
			res,
			privateNodeListWithCurrency.sort((a, b) => b.createdAt - a.createdAt)
		);
		privateNodeListArr.maxPrivateNodeListCount = user.maxPrivateNodeListCount;
		return res.status(200).json({
			privateNodeListArr,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

// @route DELETE api/user/privateNodeList
// @desc DELTE user privateNodeList txHash
// @access Public
exports.deletePrivateNodeListAddress = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });
		if (!req.body.txHash) return res.status(500).json({ message: TX_HASH_NOT_PROVIDED });
	
		let currency = req.body.currency;
		if (!currency ) return res.status(500).json({ message: CURRENCY_NOT_PROVIDED});
		else if (currency && currency !== btcu && currency !== btcu_testnet) {
			return res.status(500).json({ message: INVALID_CURRENCY });
		}

		let isAddressExist = () => {
			for (const iterator of user.privateNodeList) {
				if (iterator.txHash === req.body.txHash && iterator.currency === req.body.currency) return true;
			}
		};
		if (!isAddressExist()) return res.status(500).json({ message: TX_HASH_NOT_FOUND });

		let userNew = await User.findOneAndUpdate({ token, ['privateNodeList.txHash']: req.body.txHash, ['privateNodeList.currency']: req.body.currency,}, { $pull: { privateNodeList: { txHash: req.body.txHash, currency: req.body.currency } } }, { new: true });
		const privateNodeListWithCurrency = await filterWatchListByCurrency(userNew.privateNodeList, currency)

		return res.status(200).json({
			privateNodeList: privateNodeListWithCurrency,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

// exports.updateMaxPrivateNodeListCount = async function (req, res) {       //TODO IF NEEDED
// 	try {
// 	} catch (error) {
// 		res.status(500).json({ message: error.message });
//	}
//};

