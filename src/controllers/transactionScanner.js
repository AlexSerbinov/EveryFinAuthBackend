require('dotenv').config();
const fetch = require('node-fetch');
const User = require('../models/user');
const watchListTransactions = require('../models/watchListTransactions');
const { txTypeSpreader, destinationSpreader } = require('../services/notificationService/spreader');
const { isMasternodeAddress } = require('../middlewares/cusotomValidator.js');
let watchListAddressArr = [];
let dailyEmailLimitUpdated = false;
let testRedisObject =
	'{"currency":"Mainnet", "txid":"new_outgoing","version":2,"size":178,"locktime":0,"vin":[{"txid":"864959cca13f2cc052939f5cad11b75d5f0826b92a2e35854de986f1717d3911","vout":1,"scriptSig":{"asm":"304402203494c8d727e5fb2a9c4e6db9b11948d4bf31b82f40c714f0b58ad1c75d6d747302201f46aecb7aee646ef5dbf62e6254f9735a6c2ec9fb77c32f1090d9793f1d58b701","hex":"47304402203494c8d727e5fb2a9c4e6db9b11948d4bf31b82f40c714f0b58ad1c75d6d747302201f46aecb7aee646ef5dbf62e6254f9735a6c2ec9fb77c32f1090d9793f1d58b701"},"sequence":4294967295}],"vout":[{"value":0,"n":0,"scriptPubKey":{"asm":"","hex":"","type":"nonstandard"}},{"value":3784.55042408,"n":1,"scriptPubKey":{"asm":"03fad77a35592c335b077351570e26540e90935f39b54c98df9bdb135a43f24b57 OP_CHECKSIG","hex":"2103fad77a35592c335b077351570e26540e90935f39b54c98df9bdb135a43f24b57ac","reqSigs":1,"type":"pubkey","addresses":["mic54R1mfEY3keWx223YxGDGJVZ86Dadq7"]}}],"hex":"020000000111397d71f186e94d85352e2ab926085f5db711ad5c9f9352c02c3fa1cc594986010000004847304402203494c8d727e5fb2a9c4e6db9b11948d4bf31b82f40c714f0b58ad1c75d6d747302201f46aecb7aee646ef5dbf62e6254f9735a6c2ec9fb77c32f1090d9793f1d58b701ffffffff0200000000000000000068a9ad1d58000000232103fad77a35592c335b077351570e26540e90935f39b54c98df9bdb135a43f24b57ac000000000000","block_id":31436,"hash":"bc3b1108b97818790cc9c677420329cf5bfff18a9d9bc765ccdb28f7f2582428","is_coinbase":true,"time":1710465506313,"mediantime":"2021-01-12T15:30:06.313Z","input_count":1,"output_count":2,"output_total":3884.55042408,"input_total":3534.55042408,"from":["1JMjBBd4NcS7eJpfqauAn2a6MjSjCHSR6d"],"to":["mic54R1mfEY3keWx223YxGDGJVZ86Dadq7"],"fee":0}';
setInterval(() => {
	getAllWatchlistAddress();
}, 3000);
setInterval(() => {
	entryPoint('1', testRedisObject);
}, 300);
setInterval(() => {
	emailCounterUpdater();
}, 60000);
//var today = new Date();
//var hours = today.getUTCHours();

const entryPoint = async function (chanel, message) {
	try {
		let jsonMess = JSON.parse(message);
		let currency = jsonMess.currency;
		const incomingAddresses = await txParser(message);
		const haveToMessageArray = await findNewUser(incomingAddresses);
		const usersFromWatchList = await findUserByWatchListAddress(haveToMessageArray);
		let mapedNetworks = await currencyMapper(usersFromWatchList, currency);
		await txInfoPinner(mapedNetworks, message);
		await txTypeSpreader(mapedNetworks); // set incoming or outgoing status
		await destinationSpreader(mapedNetworks); // spread info to email and to Internal

		// console.log(usersFromWatchList);
	} catch (error) {
		console.error(error);
	}
};

const txParser = async function (message) {
	try {
		let incomingAddresses = [];
		const newTxes = JSON.parse(message);
		incomingAddresses.push(newTxes.from);
		incomingAddresses.push(newTxes.to);
		incomingAddresses = Array.from(new Set(incomingAddresses.flat()));
		// я целый час не мог понять как  написать эту фенкцию, она как-то работает но довольно не оптимизировано. Но суть её в том
		// что она берет все адреса из массива from и to входящей функции добавляет их в массив, а потом удаляет повторяющеися элементы с помощью Set
		return incomingAddresses;
	} catch (error) {
		console.error(error);
	}
};

const findNewUser = async function (incomingAddresses) {
	try {
		let haveToMessageArray = [];
		for (let i = 0; i < incomingAddresses.length; i++) {
			if (watchListAddressArr.includes(incomingAddresses[i])) {
				haveToMessageArray.push(incomingAddresses[i]);
			}
		}
		return haveToMessageArray;
	} catch (error) {
		console.error(error);
	}
};

const findUserByWatchListAddress = async function (message) {
	try {
		let usersWithInfo = [];
		await Promise.all(
			message.map(async (elem) => {
				const users = await User.find({ ['watchList.address']: elem });
				for (const user of users) {
					for (const iterator of user.watchList) {
						if (!message.includes(iterator.address)) continue; // возможно не работает
						if (!isMasternodeAddress(iterator.address))
							usersWithInfo.push({ address: iterator.address, email: user.email, name: user.login, token: user.token, notificationStatus: iterator.notificationStatus, notificationDestination: iterator.notificationDestination, currency: iterator.currency, dailyEmailLimit: user.dailyEmailLimit, thisDayEmailSent: user.thisDayEmailSent });
					}
				}
			})
		);
		usersWithInfo = removeDublicatesFromArray(usersWithInfo);
		return usersWithInfo;
	} catch (error) {
		console.error(error);
	}
};
const currencyMapper = async function (message, network) {
	try {
		let usersWithInfo = [];
		await Promise.all(
			message.map(async (iterator) => {
				if (iterator.currency === 'btcu' && network === 'Mainnet') {
					iterator.currency = 'Mainnet';
					usersWithInfo.push(iterator);
				}
				if (iterator.currency === 'btcu_testnet' && network === 'Orion') {
					iterator.currency = 'Orion';
					usersWithInfo.push(iterator);
				}
			})
		);
		return usersWithInfo;
	} catch (error) {
		console.error(error);
	}
};

const txInfoPinner = async (watchListUsers, transaction) => {
	transaction = JSON.parse(transaction);
	await Promise.all(
		watchListUsers.map(async (elem) => {
			elem.transactionLink = `${process.env.PRODUCTION_LINK}transaction/${transaction.txid}`;
			(elem.txHash = transaction.txid), (elem.addressSent = transaction.from);
			elem.addressReceived = transaction.to;
			elem.value = transaction.output_total;
			elem.timestamp = transaction.time;
			elem.type = '';
		})
	);
};
const emailCounterUpdater = async () => {
	const today = new Date();
	const hours = today.getUTCHours();
	if (hours === 0 && !dailyEmailLimitUpdated) {
		await User.update({}, { $set: { thisDayEmailSent: 0 } }, { multi: true });
		dailyEmailLimitUpdated = true;
	} else if (hours !== 0) dailyEmailLimitUpdated = false;
};

// эта функция работает по интервалу и достает все ватчлист адреса с бд в переменную
const getAllWatchlistAddress = async () => {
	try {
		const users = await User.find({});
		for (const user of users) {
			for (const iterator of user.watchList) {
				if (isMasternodeAddress(iterator.address)) continue;
				if (!watchListAddressArr.includes(iterator.address)) watchListAddressArr.push(iterator.address);
			}
		}
	} catch (error) {
		console.error(error);
	}
};

//from gitHub
const removeDublicatesFromArray = (arr = [], compareProps = []) => {
	try {
		let modifiedArray = [];
		if (compareProps.length === 0 && arr.length > 0) compareProps.push(...Object.keys(arr[0]));
		arr.map((item) => {
			if (modifiedArray.length === 0) {
				modifiedArray.push(item);
			} else {
				if (!modifiedArray.some((item2) => compareProps.every((eachProps) => item2[eachProps] === item[eachProps]))) {
					modifiedArray.push(item);
				}
			}
		});
		return modifiedArray;
	} catch {
		console.error(error);
	}
};

module.exports = { txParser, findNewUser, entryPoint };
