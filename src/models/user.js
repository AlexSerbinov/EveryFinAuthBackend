const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { genRandHex } = require('../services/genRandHex');

const Schema = mongoose.Schema;

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const Token = require('../models/token');

const UserSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			unique: true,
			required: 'Your email is required',
			trim: true,
		},

		login: {
			type: String,
			unique: true,
			required: false,
			index: true,
			sparse: true,
			expires: 20,
		},

		password: {
			type: String,
			required: 'Your password is required',
			max: 100,
		},

		token: {
			// legacy
			type: String,
			required: false,
			default: '',
			max: 600,
		},

		address: {
			// legacy
			type: String,
			required: false,
			// default: '',
			max: 64,
		},

		userId: {
			type: String,
			required: true,
			default: genRandHex(20),
			max: 50,
		},

		jwtCreatedAt: {
			// legacy
			type: Date,
			required: true,
			default: Date.now,
			// expires: 43200,
			// expires: 1, //changed
		},

		accessToken: {
			type: String,
		},

		refreshToken: {
			type: String,
		},

		// dailyEmailLimit: {
		// 	type: Number,
		// 	required: true,
		// 	default: 25,
		// 	// expires: 43200,
		// 	// expires: 1, //changed
		// },
		// thisDayEmailSent: {
		// 	type: Number,
		// 	required: false,
		// 	default: 0,
		// 	// expires: 43200,
		// 	// expires: 1, //changed
		// },

		name: {
			type: String,
			required: false,
			default: '',
			max: 100,
		},

		lastName: {
			type: String,
			required: false,
			default: '',
			max: 100,
		},

		publicProfileBio: {
			type: String,
			required: false,
			default: '',
			max: 200,
		},

		// watchList: {
		// 	type: Array,
		// 	required: false,
		// 	default: [],
		// 	// max: 200,
		// },
		// privateNodeList: {
		// 	type: Array,
		// 	required: false,
		// 	default: [],
		// 	// max: 200,
		// },

		avatar: {
			type: String,
			required: false,
			default: '',
			max: 255,
		},

		isVerified: {
			type: Boolean,
			default: false,
		},

		resetPasswordToken: {
			type: String,
			required: false,
		},

		resetPasswordExpires: {
			type: Date,
			required: false,
		},
	}
	// { timestamps: true }
);

UserSchema.pre('save', function (next) {
	const user = this;

	if (!user.isModified('password')) return next();

	bcrypt.genSalt(10, function (err, salt) {
		if (err) return next(err);

		bcrypt.hash(user.password, salt, function (err, hash) {
			if (err) return next(err);

			user.password = hash;
			next();
		});
	});
});

UserSchema.methods.comparePassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.generateAccessToken = function () {
	const User = this;

	let payload = {
		id: this._id,
		email: this.email,
		login: this.login,
	};

	const secret = JWT_SECRET;
	// console.log(`1----=-----=----=----=----=----=----- User -----=-----=-----=-----=-- 1`);
	// console.log(User);
	// console.log({ _id: User._id }, secret);
	// console.log(`2----=-----=----=----=----=----=----- User -----=-----=-----=-----=-- 2`);
	const token = jwt.sign({ _id: User._id }, secret, {
		expiresIn: '1m',
	});
	User.accessToken = token;
};

// const accessToken = jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION_TIME });

UserSchema.methods.generateRefreshToken = function () {
	const User = this;
	const secret = REFRESH_TOKEN_SECRET;
	const refreshToken = jwt.sign({ _id: User._id }, secret, {
		expiresIn: '1m',
	});
	User.refreshToken = refreshToken;
};

UserSchema.methods.generateJWT = function () {
	const today = new Date();
	const expirationDate = new Date(today);
	// expirationDate.setDate(today.getDate());  //changed
	expirationDate.setDate(today.getDate() + 1200);

	let payload = {
		id: this._id,
		email: this.email,
		login: this.login,
	};

	return jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: parseInt(expirationDate.getTime() / 1000, 10),
	});
};

UserSchema.methods.generatePasswordReset = function () {
	this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
	// this.resetPasswordExpires = Date.now() + 60000; //expires in an hour      //changed
};

UserSchema.methods.generateVerificationToken = function () {
	let payload = {
		userId: this._id,
		token: crypto.randomBytes(20).toString('hex'),
	};
	return new Token(payload);
};

module.exports = mongoose.model('Users', UserSchema);
