const User = require('../models/user');
// const WatchList = require('../models/watchList');
const Token = require('../models/token');
const jwt = require('jsonwebtoken');
const { eventMailPrepair } = require('../services/notificationService/emailSender');
const { isEmail, oneLowercaseChar, oneUppercaseChar, oneNumber, oneSpecialChar, isEthereumAddress } = require('../middlewares/cusotomValidator.js');
const { genRandHex } = require('../services/genRandHex');

const { ERROR_LOGIN_PASSWORD_INVALID, ERROR_EMAIL_PASSWORD_INVALID, ERROR_USER_NOT_VERIFICATION, ERROR_EMAIL_TAKEN, ERROR_LOGIN_TAKEN, ERROR_NO_USER, ERROR_TOKEN_INVALID, ERROR_OLD_PASSWORD_INVALID, ERROR_PASSWORD_NOT_MATCH, ERROR_USER_ALREADY_VERIFIED, ERROR_WRONG_PASSWORD, ERROR_WRONG_EMAIL, ERROR_WRONG_MASTERNODE_ADDRESS, MISSING_CAPTCHA_DATA, CAPTCHA_VALIDATION_ERROR } = require('../const/const.js');

// @route POST api/auth/register
// @desc Register user
// @access Public
exports.register = async (req, res) => {
	try {
		// const initedCaptcha = await captcha.init()
		// const captchaValidation = await initedCaptcha.validate(req.body);
		// if (!captchaValidation) return res.status(401).json({ message: CAPTCHA_VALIDATION_ERROR });

		const { email, password } = req.body;
		if (isEmail(email)) return res.status(500).json({ message: ERROR_WRONG_EMAIL });
		if ((oneLowercaseChar(password), oneUppercaseChar(password), oneNumber(password), oneSpecialChar(password))) return res.status(500).json({ message: ERROR_WRONG_PASSWORD });
		if (password != req.body.confirmPassword) return res.status(500).json({ message: ERROR_PASSWORD_NOT_MATCH });

		let user = await User.findOne({ email });
		if (user)
			return res.status(400).json({
				message: ERROR_EMAIL_TAKEN,
			});

		// user = await User.findOne({ login });
		// if (user)
		// 	return res.status(401).json({
		// 		message: ERROR_LOGIN_TAKEN,
		// 	});

		const newUser = new User({ ...req.body, role: 'basic' });
		newUser.userId = genRandHex(24);
		const user_ = await newUser.save();
		await sendVerificationEmail(user_, req, res);
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// @route POST api/auth/login
// @desc Login user and return JWT token
// @access Public
exports.login = async (req, res) => {
	try {
		// const initedCaptcha = await captcha.init()
		// const captchaValidation = await initedCaptcha.validate(req.body);
		// if (!captchaValidation) return res.status(401).json({ message: CAPTCHA_VALIDATION_ERROR });

		const { email, password } = req.body;
		if (!email || isEmail(email)) return res.status(500).json({ message: ERROR_WRONG_EMAIL });
		if ((oneLowercaseChar(password), oneUppercaseChar(password), oneNumber(password), oneSpecialChar(password))) return res.status(500).json({ message: ERROR_WRONG_PASSWORD });
		let user = await User.findOne({ email });

		if (!user)
			return res.status(400).json({
				message: ERROR_NO_USER,
			});

		if (!user.comparePassword(password)) return res.status(401).json({ message: ERROR_EMAIL_PASSWORD_INVALID });
		// Make sure the user has been verified
		if (!user.isVerified)
			return res.status(401).json({
				message: ERROR_USER_NOT_VERIFICATION,
			});

		await user.generateAccessToken();
		await user.generateRefreshToken();

		res.json({
			accessToken: user.accessToken,
			refreshToken: user.refreshToken,
			address: user.address,
			userId: user.userId,
			avatar: user.avatar,
			email: user.email,
			name: user.name,
			lastName: user.lastName,
			publicProfileBio: user.publicProfileBio,
			isVerified: user.isVerified,
			// login: user.login,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

// ===EMAIL VERIFICATION
// @route GET api/verify/:token
// @desc Verify token
// @access Public
exports.verify = async (req, res) => {
	if (!req.body.token) return res.status(400).json({ message: ERROR_TOKEN_INVALID });

	try {
		// Find a matching token
		const token = await Token.findOne({ token: req.body.token });
		if (!token)
			return res.status(400).json({
				message: ERROR_TOKEN_INVALID,
			});
		// If we found a token, find a matching user
		let user = await User.findOne({ _id: token.userId });
		if (!user) return res.status(400).json({ message: ERROR_TOKEN_INVALID });
		if (user.isVerified) return res.status(400).json({ message: ERROR_USER_ALREADY_VERIFIED });
		// Verify and save the user
		user.isVerified = true;
		user.save();
		// let newToken = user.generateJWT(); //  maybe will be in future

		// await User.findOneAndUpdate({ _id: token.userId }, { token: user.generateJWT(), jwtCreatedAt: Date.now() });
		// user = await User.findOne({ _id: token.userId });
		await user.generateAccessToken();
		await user.generateRefreshToken();

		res.status(200).send({
			accessToken: user.accessToken,
			refreshToken: user.refreshToken,
			userId: user.userId,
			isVerified: user.isVerified,
			email: user.email,
			// login: user.login,
			address: user.address,
			name: user.name,
			lastName: user.lastName,
			avatar: user.avatar,
			publicProfileBio: user.publicProfileBio,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @route POST api/refreshToken
// @desc Regenerate access token by refresh
// @access Public

exports.refreshToken = async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(401).send({
				message: 'No refresh token provided',
			});
		}

		await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		const user = await User.findOne(refreshToken._id).exec();

		if (!user) {
			return res.status(401).send({
				message: 'User not found',
			});
		}

		await user.generateAccessToken();
		res.status(200).send({
			accessToken: user.accessToken,
			message: 'succesfully generated new access token',
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			error,
		});
	}
};

// @route POST api/resend
// @desc Resend Verification Token
// @access Public
exports.resendToken = async (req, res) => {
	try {
		const { email } = req.body;

		const user = await User.findOne({ email });

		if (!user)
			return res.status(401).json({
				message: ERROR_EMAIL_PASSWORD_INVALID,
			});

		if (user.isVerified)
			return res.status(400).json({
				message: ERROR_USER_ALREADY_VERIFIED,
			});

		await sendVerificationEmail(user, req, res);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

async function sendVerificationEmail(user, req, res) {
	try {
		const token = user.generateVerificationToken();
		await token.save();
		let to = user.email;
		let link;
		if (process.env.ENVIRONMENT === 'development') {
			link = `${process.env.DEVELOPMENT_LINK}verification-user?token=${token.token}`;
		} else link = `${process.env.PRODUCTION_LINK}verification-user?token=${token.token}`;
		let params = {
			confirmationLink: link,
		};
		eventMailPrepair('confirmRegistration', to, params);
		// await sendEmail({ to, from, subject, html });

		res.status(200).json({
			// message: 'A verification email has been sent to ' + user.email + '. need to use this link' + link,
			message: 'A verification email has been sent to ' + user.email + '. need to use token for user confirmation: ' + token.token,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}
