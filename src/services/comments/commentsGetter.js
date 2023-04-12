const Comments = require('../../models/comments');
const { deleteFields } = require('../../services/deleteFields');
const { paginateData } = require('../../services/paginateData');
const { repliesPinner } = require('./repliesPinner');


let commentsGetter = async (req, res) => {
	try {
		const data = req.params.blockchainData;
		const currency = req.params.currency.toUpperCase();
		let comments = await Comments.find({ currency, blockchainData: data });
		let newArr = [];
		for (const elem of comments) {
			if (!elem.repliedToId) newArr.push(elem);
		}
		let commentsWithoutFields = await deleteFields(newArr, '_id', '__v', 'repliedToId');
		await repliesPinner(currency, data, commentsWithoutFields);
		let commentsArr = await paginateData(
			req,
			res,
			commentsWithoutFields.sort((a, b) => b.timestamp - a.timestamp)
		);
		return commentsArr
	} catch (error) {
		console.error(error);
	}
};

module.exports = { commentsGetter };



