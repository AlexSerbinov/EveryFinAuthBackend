const express = require('express');
const Mailing = require('../controllers/mailing');
const router = express.Router();

// router.get('/', Mailing.getMails);
router.post('/', Mailing.pushMail);

module.exports = router;
