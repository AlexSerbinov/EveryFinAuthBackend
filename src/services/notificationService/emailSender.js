const sendEmail = require('./nodemailer');
const INCOMING_TX = 'incomingTx';
const OUTGOING_TX = 'outgoingTx';
const RESTORE_PASSWORD = 'Restore Password';
const PASSWORD_CHANGE = 'Password Changed';
const CONFIRM_REGISTRATION = 'Confirm Email for Registration';
const { makeConfirmHtml } = require('./templates/confirmEmail');
const { makeResetHtml } = require('./templates/resetPassword');
const passwordChangedHthml = require('./templates/passwordChanged');

const sendVerificationEmail = async (user, req, res) => {
	try {
		const token = user.generateVerificationToken();
		await token.save();
		const to = user.email;
		let link;
		if (process.env.ENVIRONMENT === 'development') {
			link = `${process.env.DEVELOPMENT_LINK}/api-user/auth/verify`;
		} else {
			link = `${process.env.PRODUCTION_LINK}/api-user/auth/verify`;
		}
		const html = await makeConfirmHtml(link, token.token);
		console.log(`1----=-----=----=----=----=----=----- confirm email HTML -----=-----=-----=-----=-- 1`)
		console.log(html);
		console.log(`2----=-----=----=----=----=----=----- confirm email HTML -----=-----=-----=-----=-- 2`)
		
		await sendEmail({ to: to, subject: CONFIRM_REGISTRATION, html });
		res.status(200).json({
			message: 'A verification email has been sent to ' + user.email + '. need to use token for user confirmation: ',
			token: token.token
		});
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

const sendResetEmail = async (to, name, resetPasswordToken) => {
	try {
		const link = process.env.ENVIRONMENT === 'development' ? `${process.env.DEVELOPMENT_LINK}/api-user/auth/reset-password` : `${process.env.PRODUCTION_LINK}/api-user/auth/reset-password`;
		console.log(`1----=-----=----=----=----=----=----- html reset -----=-----=-----=-----=-- 1`)
		const html = await makeResetHtml(link, resetPasswordToken);
		console.log(html);
		console.log(`2----=-----=----=----=----=----=----- html reset -----=-----=-----=-----=-- 2`)
		
		await sendEmail({ to, subject: RESTORE_PASSWORD, html });
	} catch (error) {
		console.log(error);
	}
};

const sendChangePasswordNotif = async (to, name) => {
	try {
		const html = passwordChangedHthml;
		console.log(`1----=-----=----=----=----=----=----- change password HTMl -----=-----=-----=-----=-- 1`)
		console.log(html);
		console.log(`2----=-----=----=----=----=----=----- change password HTMl -----=-----=-----=-----=-- 2`)
		
		await sendEmail({ to, subject: PASSWORD_CHANGE, html });
	} catch (error) {
		console.log(error);
	}
};

module.exports = { sendResetEmail, sendChangePasswordNotif, sendVerificationEmail };
