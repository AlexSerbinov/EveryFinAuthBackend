// const redis = require('redis');
// const { redisConf } = require('../../config/config.js');
// const redisClient = redis.createClient(`redis://${redisConf.database}`);
// redisClient.on('error', (error) => {
// 	console.error('error: trouble with redis', new Date(Date.now()));
// });
const INCOMING_TX = 'incomingTx';
const OUTGOING_TX = 'outgoingTx';
const RESTORE_PASSWORD = 'restorePassword';
const PASSWORD_CHANGE = 'passwordChange';

let prepareTxEventForEmail = async (watchListObject) => {
	try {
		if (watchListObject.type === 'incoming') {
			let params = {
				name: watchListObject.name,
				transactionLink: watchListObject.transactionLink,
				addressReceived: watchListObject.address,
				currency: watchListObject.currency,
				addressSent: watchListObject.addressSent,
				value: watchListObject.value,
			};
			eventMailPrepair(INCOMING_TX, watchListObject.email, params);
		} else if (watchListObject.type === 'outgoing') {
			let params = {
				name: watchListObject.name,
				transactionLink: watchListObject.transactionLink,
				currency: watchListObject.currency,
				addressReceived: watchListObject.addressReceived,
				addressSent: watchListObject.addressSent, //new need to test with Yarik
				value: watchListObject.value,
			};
			eventMailPrepair(OUTGOING_TX, watchListObject.email, params);
		}
	} catch (error) {
		console.log(error);
	}
};
let sendResetEmail = async (to, name, restoreLink) => {
	try {
		let params = {
			name,
			restoreLink,
		};
		eventMailPrepair(RESTORE_PASSWORD, to, params);
	} catch (error) {
		console.log(error);
	}
};

let sendChangePasswordNotif = async (to, name) => {
	try {
		let params = {
			name,
		};
		eventMailPrepair(PASSWORD_CHANGE, to, params);
	} catch (error) {
		console.log(error);
	}
};

let eventMailPrepair = async (eventName, email, params) => {
	try {
		// if (eventName === 'confirmRegistration' || eventName === RESTORE_PASSWORD || eventName === PASSWORD_CHANGE) {
		emailMsg = {
			eventName,
			address: email,
			params,
		};
		console.log('\x1b[33m%s\x1b[0m', '----------------------------------------------');
		console.log(emailMsg);
		messageSender(JSON.stringify(emailMsg));
		// }
	} catch (error) {
		console.log(error);
	}
};

const messageSender = async (emailMsg) => {
	try {
		// redisClient.publish('mail', emailMsg);
		console.log(`mock mail sended (in reality was not sent 1)`);
		console.log(emailMsg);
		console.log(`mock mail sended (in reality was not sent 2)`);
		res.status(200).json({
			// message: 'A verification email has been sent to ' + user.email + '. need to use this link' + link,
			// message: 'A verification email has been sent to ' + user.email + '. need to use token for user confirmation: ' + token.token,
			message: emailMsg
		});
	} catch (error) {
		console.log(error);
	}
};

module.exports = { prepareTxEventForEmail, eventMailPrepair, sendResetEmail, sendChangePasswordNotif };
