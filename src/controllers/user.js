const User = require('../models/user');
const { uploader, sendEmail } = require('../utils/index');
const TOKEN_LIFE = +process.env.token_life;
const { ERROR_NO_USER, ERROR_TOKEN_LIFETIME_IS_OVER } = require('../const/const.js');
const jwt = require('jsonwebtoken');
const { genRandHex } = require('../services/genRandHex');
const { validationResult } = require('express-validator');

exports.getUsers = async (req, res) => {
	//for test
	try {
		const users = await User.find({});

		if (!users) {
			return res.status(404).send({
				message: 'No users found',
			});
		}

		res.status(200).send({
			data: users,
		});
	} catch (error) {
		res.status(500).send({
			error,
		});
	}
};

exports.getProfile = async (req, res) => {
	try {
		const { user } = req;
		if (!user) {
			return res.status(401).json({
				status: 401,
				message: 'Unauthorized',
			});
		}

		const userProfile = await User.findById(user._id);

		if (!userProfile) {
			return res.status(404).json({
				status: 404,
				message: 'User not found',
			});
		}

		res.status(200).json({
			status: 200,
			message: 'Profile fetched successfully',
			data: {
				email: userProfile.email,
				name: userProfile.name,
				lastName: userProfile.lastName,
				publicProfileBio: userProfile.publicProfileBio,
				avatar: userProfile.avatar,
				login: user.login,
				isVerified: user.isVerified,
				avatar: user.avatar,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: 'An error occurred while fetching the profile',
			error: error.message,
		});
	}
};

// @route GET admin/user/allUsers
// @desc Returns all users
// @access Public
exports.index = async function (req, res) {
	const users = await User.find({});
	res.status(200).json({ users });
};

exports.findByUserId = async function (req, res) {
	try {
		const userId = req.params.userId;
		let user = await User.findOne({ userId });
		res.status(200).json({ user });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @route DELETE api-user/user/allUsers
// @desc DELETE all users
// @access Public
exports.deleteAllUsers = async function (req, res) {
	// const users = await User.deleteMany();
	res.status(200).json({ users });
};

// @route GET api-user/user/
// @desc Returns a specific user by header
// @access Public
exports.show = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });

		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });
		res.status(200).json({
			token: user.token,
			jwtCreatedAt: +user.jwtCreatedAt,
			_id: user._id,
			avatar: user.avatar,
			email: user.email,
			name: user.name,
			lastName: user.lastName,
			publicProfileBio: user.publicProfileBio,
			isVerified: user.isVerified,
			login: user.login,
			masterNodeAddress: user.masterNodeAddress,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @route PUT api/user/upload
// @desc Update user details
// @access Public
exports.uploadAvatar = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });

		if (Object.keys(req.files).length != 0) {
			const avatarLink = await uploader(req);
			await User.findOneAndUpdate({ token }, { $set: req.body, $set: { avatar: avatarLink }, new: true });
			const userNew = await User.findOne({ token });

			if (userNew)
				return res.status(200).json({
					token: userNew.token,
					jwtCreatedAt: +userNew.jwtCreatedAt,
					_id: userNew._id,
					email: userNew.email,
					name: userNew.name,
					lastName: userNew.lastName,
					publicProfileBio: userNew.publicProfileBio,
					avatar: userNew.avatar,
					isVerified: userNew.isVerified,
					login: userNew.login,
					masterNodeAddress: userNew.masterNodeAddress,
				});
		} else return res.status(500).json({ message: 'something went wrong' });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: error.message });
	}
};

// @route DELETE api/user/upload
// @desc Update user details
// @access Public
exports.deleteAvatar = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });
		await User.findOneAndUpdate({ token }, { $set: { avatar: '' }, new: true });
		const userNew = await User.findOne({ token });

		if (userNew)
			return res.status(200).json({
				token: userNew.token,
				jwtCreatedAt: +userNew.jwtCreatedAt,
				_id: userNew._id,
				email: userNew.email,
				name: userNew.name,
				lastName: userNew.lastName,
				publicProfileBio: userNew.publicProfileBio,
				avatar: userNew.avatar,
				isVerified: userNew.isVerified,
				login: userNew.login,
				masterNodeAddress: userNew.masterNodeAddress,
			});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @route PUT api/user/
// @desc Update user details
// @access Public
exports.update = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });

		let userNew = await User.findOneAndUpdate({ token }, { $set: req.body, new: true }, { new: true });

		return res.status(200).json({
			token: userNew.token,
			jwtCreatedAt: +userNew.jwtCreatedAt,
			_id: userNew._id,
			email: userNew.email,
			name: userNew.name,
			lastName: userNew.lastName,
			publicProfileBio: userNew.publicProfileBio,
			avatar: userNew.avatar,
			isVerified: userNew.isVerified,
			login: userNew.login,
			masterNodeAddress: userNew.masterNodeAddress,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @route DESTROY api/user/
// @desc Delete User by token
// @access Public
exports.destroy = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });
		await User.findByIdAndDelete(user.id);
		res.status(200).json({ message: 'User has been deleted' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @route DESTROY api/user/byEmail{email}
// @desc Delete User
// @access Public
exports.destroyByEmail = async function (req, res) {
	try {
		const email = req.params.email;
		let resDel = await User.findOneAndDelete({ email });
		res.status(200).json({ message: resDel });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
