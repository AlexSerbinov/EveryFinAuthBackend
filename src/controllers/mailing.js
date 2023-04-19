require('dotenv').config();
const Mails = require('../models/mails');
const { deleteFields } = require('../services/deleteFields');
const { isEmail } = require('../middlewares/cusotomValidator.js');

exports.pushMail = async function (req, res) {
	try {

		let email = req.body.email;
		let type = req.body.type;
		const mail = await Mails.findOne({ email });
		if (isEmail(email)) return res.status(400).json({ message: "ERROR_WRONG_EMAIL" });
		if(mail) return res.status(400).json({ message: "EMAIL_ALREADY_TAKEN" });
		if(type !== 'DEVELOPER' && type !== 'COMMUNITY') return res.status(500).json({ message: "ERROR_WRONG_TYPE" });

		let emailData = {
			email,
			type,
			timestamp: Date.now(),
		};
		let newMail = await new Mails(emailData).save();
		let mailsWithoutFields = await deleteFields(newMail, '_id', '__v');
		return res.status(200).json({
			mails: mailsWithoutFields,
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
