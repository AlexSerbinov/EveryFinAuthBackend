require('dotenv').config();
const Comments = require('../models/comments');
const User = require('../models/user');
const { deleteFields } = require('../services/deleteFields');
const { genRandHex } = require('../services/genRandHex');
const { commentsGetter } = require('../services/comments/commentsGetter');

const TOKEN_LIFE = +process.env.token_life;
const { ERROR_NO_USER, ERROR_TOKEN_LIFETIME_IS_OVER, COMMENT_NOT_FOUND, COMMENT_NOT_PROVIDED, COMMENT_ID_NOT_PROVIDED, ERROR_CANNOT_REPLY_TO_REPLY } = require('../const/const.js');

// await Comments.deleteMany({});
// @route POST api-user/comments
// @desc POST add a comment
// @access Public
exports.pushComment = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > process.env.token_life) {
			return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });
		}
		let userId = user.userId;
		let login = user.login;
		let avatar = user.avatar;
		let currency = req.body.currency;
		let blockchainData = req.body.blockchainData;
		let comment = req.body.comment;
		let commentId = genRandHex(32);

		let commentData = {
			commentId,
			userId,
			name: login,
			avatar,
			currency,
			blockchainData,
			comment,
			timestamp: Date.now(),
		};
		let newComment = await new Comments(commentData).save();
		let commentWithoutFields = await deleteFields(newComment, '_id', '__v');
		return res.status(200).json({
			comment: commentWithoutFields,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

// @route POST api-user/comments/reply
// @desc POST add a comment
// @access Public
exports.replyByComment = async function (req, res) {
	try {
		let token = req.headers.authorization;
		const repliedToId = req.body.repliedToId;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > process.env.token_life) {
			return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });
		}
		const commentForReply = await Comments.findOne({ commentId: repliedToId });
		if (!commentForReply) return res.status(500).json({ message: COMMENT_NOT_FOUND });
		if (!req.body.repliedToId) return res.status(500).json({ message: COMMENT_ID_NOT_PROVIDED });
		if (commentForReply.repliedToId) return res.status(500).json({ message: ERROR_CANNOT_REPLY_TO_REPLY });

		const userId = user.userId;
		const login = user.login;
		const avatar = user.avatar;
		const currency = commentForReply.currency;
		const blockchainData = commentForReply.blockchainData;
		const comment = req.body.comment;
		const commentId = genRandHex(32);

		const commentData = {
			commentId,
			userId,
			repliedToId,
			name: login,
			avatar,
			currency,
			blockchainData,
			comment,
			timestamp: Date.now(),
		};

		let newComment = await new Comments(commentData).save();
		let commentWithoutFields = await deleteFields(newComment, '_id', '__v');
		return res.status(200).json({
			comment: commentWithoutFields,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

// @route GET api-user/comments/
// @desc GET user comments for blockchain
// @access Public
exports.getComments = async function (req, res) {
	try {
		// await Comments.deleteMany({});

		let comments = await commentsGetter(req, res);
		return res.status(200).json({
			comments,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

exports.deleteOneComment = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });
		if (!req.body.commentId) return res.status(500).json({ message: COMMENT_ID_NOT_PROVIDED });

		const commentId = req.body.commentId;
		let deleted = await Comments.findOneAndDelete({ commentId });
		if (!deleted) return res.status(500).json({ message: COMMENT_NOT_FOUND });
		let commentsWithoutFields;
		if (!deleted.repliedToId) commentsWithoutFields = await deleteFields(deleted, '_id', '__v', 'repliedToId');
		else commentsWithoutFields = await deleteFields(deleted, '_id', '__v');

		return res.status(200).json({
			comment: commentsWithoutFields,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

exports.deleteOneCommentAndReturnOther = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });
		if (!req.body.commentId) return res.status(500).json({ message: COMMENT_ID_NOT_PROVIDED });
		const commentId = req.body.commentId;

		let deleted = await Comments.findOneAndDelete({ commentId });
		if (!deleted) return res.status(500).json({ message: COMMENT_NOT_FOUND });
		// bellow get other objects
		let comments = await commentsGetter(req, res);
		return res.status(200).json({
			comments,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

exports.updateOneComment = async function (req, res) {
	try {
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });
		if (!req.body.commentId) return res.status(500).json({ message: COMMENT_ID_NOT_PROVIDED });
		if (!req.body.comment) return res.status(500).json({ message: COMMENT_NOT_PROVIDED });
		const commentId = req.body.commentId;
		if ((req.body.avatar || req.body.userId || req.body.login || req.body.currency || req.body.blockchainData, req.body.timestamp)) return res.status(500).json({ message: 'Do not allow to update this data' });
		let updated = await Comments.findOneAndUpdate({ commentId }, { comment: req.body.comment, timestamp: Date.now() }, { new: true });
		if (!updated) return res.status(500).json({ message: COMMENT_NOT_FOUND });

		let commentsWithoutFields;
		if (!updated.repliedToId) commentsWithoutFields = await deleteFields(updated, '_id', '__v', 'repliedToId');
		else commentsWithoutFields = await deleteFields(updated, '_id', '__v');

		return res.status(200).json({ comment: commentsWithoutFields });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

exports.updateOneCommentAndReturnOther = async function (req, res) {
	try {
		//update data
		let token = req.headers.authorization;
		if (token.substr(0, 7) === 'Bearer ') token = token.substr(7);
		const user = await User.findOne({ token });
		if (!user) return res.status(401).json({ message: ERROR_NO_USER });
		if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) return res.status(401).json({ message: ERROR_TOKEN_LIFETIME_IS_OVER });
		if (!req.body.commentId) return res.status(500).json({ message: COMMENT_ID_NOT_PROVIDED });
		if (!req.body.comment) return res.status(500).json({ message: COMMENT_NOT_PROVIDED });

		const commentId = req.body.commentId;
		if ((req.body.avatar || req.body.userId || req.body.login || req.body.currency || req.body.blockchainData, req.body.timestamp)) return res.status(500).json({ message: 'Do not allow to update this data' });
		let updated = await Comments.findOneAndUpdate({ commentId }, { comment: req.body.comment, timestamp: Date.now() }, { new: true });
		if (!updated) return res.status(500).json({ message: COMMENT_NOT_FOUND });

		// bellow get other objects
		let comments = await commentsGetter(req, res);
		return res.status(200).json({
			comments,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};
