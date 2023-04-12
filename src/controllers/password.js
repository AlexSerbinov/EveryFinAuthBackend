require('dotenv').config();
const User = require('../models/user');
const { sendEmail } = require('../utils/index');
const { sendResetEmail, sendChangePasswordNotif } = require('../services/notificationService/emailSender');
const { isEmail, oneLowercaseChar, oneUppercaseChar, oneNumber, oneSpecialChar } = require('../middlewares/cusotomValidator.js');

const { ERROR_LOGIN_PASSWORD_INVALID, ERROR_NO_USER, ERROR_TOKEN_INVALID, ERROR_PASSWORD_NOT_MATCH, INVALID_PASSWORD_RECOVERY_LINK, PASSWORD_SUCCESSFULLY_CHANGED } = require('../const/const.js');

// @route POST api/auth/recover
// @desc Recover Password - Generates token and Sends password reset email
// @access Public
exports.recover = async (req, res) => {
	try {
		const { email } = req.body;
		if (isEmail(email)) return res.status(500).json({ message: ERROR_WRONG_EMAIL });
		const user = await User.findOne({ email });

		if (!user)
			return res.status(401).json({
				message: ERROR_NO_USER,
			});

		//Generate and set password reset token
		user.generatePasswordReset();
		// Save the updated user object
		await user.save();

		// send email
		let to = user.email;
		let name = user.name;
		let link;

		if (process.env.ENVIRONMENT === 'development') {
			link = `${process.env.DEVELOPMENT_LINK}reset-password?token=${user.resetPasswordToken}`;
		} else link = `${process.env.PRODUCTION_LINK}reset-password?token=${user.resetPasswordToken}`;
		// await sendEmail({ to, from, subject, html });
		if (name) sendResetEmail(to, name, link);
		else sendResetEmail(to, user.login, link);
		if (process.env.ENVIRONMENT === 'development') res.status(200).json({ message: `The reset email has been sent to ${user.email}. To restore in development use this code ${link}` });
		if (process.env.ENVIRONMENT === 'production')res.status(200).json({ message: `The reset email has been sent to ${user.email}` });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @route POST api/auth/reset
// @desc Reset Password - Validate password reset token and shows the password reset view
// @access Public
exports.reset = async (req, res) => {
	try {
		const { token } = req.params;
		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpires: { $gt: Date.now() },
		});

		if (!user) return res.status(401).json({ message: ERROR_TOKEN_INVALID });

		//Redirect user to form with the email address
		res.render('reset', { user });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @route POST api/auth/checkResetToken
// @desc Reset Password - Validate password reset token and shows the password reset view
// @access Public
exports.checkResetToken = async (req, res) => {
	try {
		const { token } = req.body.token;

		const user = await User.findOne({
			resetPasswordToken: token,
			// resetPasswordExpires: { $gt: Date.now() },
		});
		if (user) return res.status(200).json({ message: `token is valid` });
		if (!user) return res.status(400).json({ message: INVALID_PASSWORD_RECOVERY_LINK });

		//Redirect user to form with the email address
		// res.render("reset", { user });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @route POST api/auth/reset
// @desc Reset Password
// @access Public
exports.resetPassword = async (req, res) => {
	try {
		const { password, confirmPassword, token } = req.body;
		if (password != confirmPassword) return res.status(500).json({ message: ERROR_PASSWORD_NOT_MATCH });
		if ((oneLowercaseChar(password), oneUppercaseChar(password), oneNumber(password), oneSpecialChar(password))) return res.status(500).json({ message: ERROR_WRONG_PASSWORD });

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpires: { $gt: Date.now() },
		});

		if (!user) return res.status(401).json({ message: ERROR_TOKEN_INVALID });

		//Set the new password
		user.password = req.body.password;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		user.isVerified = true;
		await user.save();

		let to = user.email;
		if (user.name) sendChangePasswordNotif(to, user.name);
		else sendChangePasswordNotif(to, user.login);
		res.status(200).json({ message: 'Your password has been updated.' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @route PUT api/auth/changePassword
// @desc Reset Password
// @access Public
exports.changePassword = async (req, res) => {
	try {
		const { oldPassword, password, confirmPassword } = req.body;
		let token = req.headers.authorization;
		if (token && token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		else if (!token) return res.status(400).json({ message: ERROR_TOKEN_INVALID });
		const user = await User.findOne({ token });
		if (!user) return res.status(400).json({ message: ERROR_NO_USER });
		if (!user.comparePassword(oldPassword)) return res.status(400).json({ message: ERROR_LOGIN_PASSWORD_INVALID });
		if (password != confirmPassword) return res.status(500).json({ message: ERROR_PASSWORD_NOT_MATCH });
		if ((oneLowercaseChar(password), oneUppercaseChar(password), oneNumber(password), oneSpecialChar(password))) return res.status(500).json({ message: ERROR_WRONG_PASSWORD });

		//Set the new password
		user.password = req.body.password;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		user.isVerified = true;
		// Save the updated user object
		await user.save();
		const to = user.email;
		if (user.name) sendChangePasswordNotif(to, user.name);
		else sendChangePasswordNotif(to, user.login);

		res.status(200).json({ message: PASSWORD_SUCCESSFULLY_CHANGED });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
//
