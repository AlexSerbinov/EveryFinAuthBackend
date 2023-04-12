const express = require('express');
const { check } = require('express-validator');
const { ERROR_LOGIN_PASSWORD_INVALID, ERROR_USER_NOT_VERIFICATION, ERROR_EMAIL_TAKEN, ERROR_LOGIN_TAKEN, ERROR_NO_USER, ERROR_TOKEN_INVALID, ERROR_OLD_PASSWORD_INVALID } = require('../const/const.js');
const multer = require('multer');
const User = require('../controllers/user');
const authenticate = require('../middlewares/authenticate');
const { auth } = require('../middlewares/auth');

const router = express.Router();

const upload = multer().single('avatar');

//INDEX
router.get('/allUsers', User.index);
// need to set strong password for this operation!!!

// STORE
// router.post('/', User.store);

//SHOW
router.get('/', auth, User.show);
router.get('/byUserId/:userId', User.findByUserId);
router.get('/profile', auth, User.getProfile);

//UPDATE
router.put('/', User.update);
router.put('/upload/', upload, User.uploadAvatar);

//DELETE
router.delete('/allUsers', auth, User.deleteAllUsers); // need to set strong password for this operation!!!
router.delete('/upload/', User.deleteAvatar);
router.delete('/', User.destroy);
router.delete('/byEmail/:email', User.destroyByEmail);

router.get('/list', auth, User.getUsers); // test 


module.exports = router;
