const sendEmail = require('./nodemailer');
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
		// if (process.env.ENVIRONMENT === 'development') {
		// 	link = `${process.env.DEVELOPMENT_LINK}/api-user/auth/verify`;
		// } else {
		// 	link = `${process.env.PRODUCTION_LINK}/api-user/auth/verify`;
		// }
		link = `https://everyfin.machinalabs.net/auth/confirm-email?token=`
		const html = await makeConfirmHtml(link, token.token);
		await sendEmail({ to: to, subject: CONFIRM_REGISTRATION, html });
		res.status(200).json({
			message: `A verification email has been sent to ${user.email}`
		});
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

const sendResetEmail = async (to, name, resetPasswordToken) => {
	try {
		// const link = process.env.ENVIRONMENT === 'development' ? `${process.env.DEVELOPMENT_LINK}/api-user/auth/reset-password` : `${process.env.PRODUCTION_LINK}/api-user/auth/reset-password`;
		const link = `https://everyfin.machinalabs.net/auth/reset-password?token=`
		const html = await makeResetHtml(link, resetPasswordToken);
		await sendEmail({ to, subject: RESTORE_PASSWORD, html });
	} catch (error) {
		console.log(error);
	}
};

const sendChangePasswordNotif = async (to, name) => {
	try {
		const html = passwordChangedHthml;
		await sendEmail({ to, subject: PASSWORD_CHANGE, html });
	} catch (error) {
		console.log(error);
	}
};

module.exports = { sendResetEmail, sendChangePasswordNotif, sendVerificationEmail };
