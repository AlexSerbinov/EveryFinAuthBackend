const { prepareTxEventForEmail } = require('./emailSender');
const { prepareTxEventForInternalMenu } = require('./txInternalSpreader');
const { ALL, INTERNAL, EMAIL } = require('../../const/const.js');
const User = require('../../models/user');

let txTypeSpreader = async (watchListObject) => {
	try {
		for (const element of watchListObject) {
			if (element.addressSent.includes(element.address && element.addressReceived.includes(element.address))) element.type = 'self';
			else if (element.addressSent.includes(element.address)) element.type = 'outgoing';
			else if (element.addressReceived.includes(element.address)) element.type = 'incoming';
			else element.type = 'notRecognized';
		}
		return watchListObject;
	} catch (error) {
		console.log(error);
	}
};

let destinationSpreader = async (watchListObject) => {
	try {
		for (const element of watchListObject) {
			if (element.notificationDestination === EMAIL) emailLimitCheker(element);
			else if (element.notificationDestination === INTERNAL) prepareTxEventForInternalMenu(element);
			else if (element.notificationDestination === ALL) {
				emailLimitCheker(element);
				prepareTxEventForInternalMenu(element);
			}
		}
	} catch (error) {
		console.log(error);
	}
};

let emailLimitCheker = async (element) => {
	try {
		if (element.thisDayEmailSent < element.dailyEmailLimit) {
			let user = await User.findOne({ token: element.token });
			let thisDayEmailSent = user.thisDayEmailSent
			//console.log('\x1b[33m%s\x1b[0m', '----------------------------------------------')
			//console.log('thisDayEmailSent', thisDayEmailSent)
			let updateCounter = await User.findOneAndUpdate({ token: element.token }, { $set: { 'thisDayEmailSent': thisDayEmailSent+1} });
			prepareTxEventForEmail(element);
		}
	} catch (error) {
		console.log(error);
	}
};

module.exports = { txTypeSpreader, destinationSpreader };
