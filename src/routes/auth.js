const express = require('express');
const router = express.Router();

const Auth = require('../controllers/auth');
const { auth } = require('../middlewares/auth');

const Password = require('../controllers/password');
const validate = require('../middlewares/validate');

router.get('/', (req, res) => {
	console.log(req.headers.host + req.originalUrl);
	res.status(200).json({
		message: 'working',
	});
});

router.post('/register', validate, Auth.register);

router.post('/login', Auth.login);

//EMAIL Verification
router.post('/verify/', Auth.verify);
router.post('/resend', Auth.resendToken);

//Password RESET
router.post('/recover',  auth, Password.recover);

router.get('/reset/:token', Password.reset);

router.post('/check-reset-token/', Password.checkResetToken);
router.put('/changePassword', Password.changePassword);

router.post('/reset', Password.resetPassword);

router.post('/refresh-token', Auth.refreshToken);

module.exports = router;
