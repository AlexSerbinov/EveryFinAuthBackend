const express = require('express');
const router = express.Router();

const Auth = require('../controllers/auth');
const { auth } = require('../middlewares/auth');

const Password = require('../controllers/password');
const validate = require('../middlewares/validate');
/**
 * @swagger
 * /api-user/auth:
 *   get:
 *     summary: Test endpoint
 *     responses:
 *       200:
 *         description: Returns a test message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/', (req, res) => {
	console.log(req.headers.host + req.originalUrl);
	res.status(200).json({
		message: 'working',
	});
});
/**
 * @swagger
 * /api-user/auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad request (e.g., invalid input data)
 */

router.post('/register', validate, Auth.register);
/**
 * @swagger
 * /api-user/auth/login:
 *   post:
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Bad request (e.g., invalid input data)
 */

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
