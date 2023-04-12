const express = require('express');
const Comments = require('../controllers/comments');
const router = express.Router();

router.get('/:currency/:blockchainData/:numItemsPerPage/:currentPageNumber', Comments.getComments);
router.post('/', Comments.pushComment);
router.post('/reply', Comments.replyByComment);
// router.put("/", Comments.updateWatchListAddress);
router.put('/', Comments.updateOneComment);
router.put('/:currency/:blockchainData/:numItemsPerPage/:currentPageNumber', Comments.updateOneCommentAndReturnOther);
router.delete('/', Comments.deleteOneComment);
router.delete('/:currency/:blockchainData/:numItemsPerPage/:currentPageNumber', Comments.deleteOneCommentAndReturnOther);

module.exports = router;
