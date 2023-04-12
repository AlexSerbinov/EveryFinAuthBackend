const watchListTransactions = require('../../models/watchListTransactions');
const User = require('../../models/user');

const INCOMING_TX = 'incomingTx';
const OUTGOING_TX = 'outgoingTx';
//  watchListTransactions.deleteMany();

let prepareTxEventForInternalMenu = async (watchListObject) => {
	try {
		let params = {
			address: watchListObject.address,
			email: watchListObject.email,
			name: watchListObject.name,
			currency: watchListObject.currency,
			transactionType: watchListObject.type,
			transactionLink: watchListObject.transactionLink,
			txHash: watchListObject.txHash,
			addressReceived: watchListObject.addressReceived,
			addressSent: watchListObject.addressSent,
			value: watchListObject.value,
			timestamp: watchListObject.timestamp,
			token: watchListObject.token,
		};
		saveNewWatchListAddress(params);
		// deleteUnnecessaryElementsFromWatchListNotif(params);
	} catch (error) {
		console.log(error);
	}
};
const saveNewWatchListAddress = async (element) => {
	try {
		await new watchListTransactions(element).save();
		deleteUnnecessaryElementsFromWatchListNotif(element);
	} catch (error) {
		console.error(error);
	}
};

const deleteUnnecessaryElementsFromWatchListNotif = async (watchListObject) => {
	try {
		// !!  TODO переделать на поиск по userId
		let user = await watchListTransactions.find({ email: watchListObject.email }); //pseudocode
		if (user.length >= 19) {
			await watchListTransactions.deleteMany({ email: watchListObject.email });
			for (let index = 0; index < user.length; index++) {
				const element = user[index];
				let newObj = {
					token: element.token,
					addressSent: element.addressSent,
					addressReceived: element.addressReceived,
					value: element.value,
					read: element.read,
					currency: element.currency,
					address: element.address,
					email: element.email,
					name: element.name,
					txHash: element.txHash,
					transactionType: element.transactionType,
					timestamp: element.timestamp,
				};
				// console.log(element.txHash)
				// console.log('index', index)
				if (index >= 20) break;
				// !!  TODO тут при первом запуске ошибка, поставить проверку есть ли карренси
				await new watchListTransactions(newObj).save();
			}
		}
	} catch (error) {
		console.error(error);
	}
};

module.exports = { prepareTxEventForInternalMenu, deleteUnnecessaryElementsFromWatchListNotif };
