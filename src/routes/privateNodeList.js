const express = require('express');
const PrivateNodeList = require('../controllers/privateNodeList');
const router = express.Router();

router.get('/:currency/:numItemsPerPage/:currentPageNumber', PrivateNodeList.getPrivateNodeListForUser);
router.post('/', PrivateNodeList.addToPrivateNodeList);
router.put('/', PrivateNodeList.updatePrivateNodeListAddress);
router.delete('/', PrivateNodeList.deletePrivateNodeListAddress);

module.exports = router;
