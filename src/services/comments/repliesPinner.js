const Comments = require('../../models/comments');
const { deleteFields } = require('../../services/deleteFields');

let repliesPinner = async (currency, blockchainData, comments) => {
	try {
		await Promise.all(
			comments.map(async (element) => {
				if (element.commentId) {
					let replied = await Comments.find({ currency, blockchainData, repliedToId: element.commentId });
					commentsWithoutFields = await deleteFields(replied, '_id', '__v');
					element.replies = commentsWithoutFields;
				}
			})
		);
	} catch (error) {
		console.error(error);
	}
};

module.exports = { repliesPinner };

// comments.map(async(element) => {

// 	if (element.commentId) {
// 		let replied = await Comments.find({ currency, blockchainData, repliedToId: element.commentId });
//         commentsWithoutFields = await deleteFields(replied, '_id', '__v')
// 		element.replies = commentsWithoutFields;
// 	}
// });

// 		for (const element of comments) {
// 	if (element.commentId) {
// 		let replied = await Comments.find({ currency, blockchainData, repliedToId: element.commentId });
//         commentsWithoutFields = await deleteFields(replied, '_id', '__v')
// 		element.replies = commentsWithoutFields;
// 	}
// }
