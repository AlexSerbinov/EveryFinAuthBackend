const express = require('express');
const router = express.Router();

const backendApi = require('../controllers/backendApi');
// const { auth } = require('../middlewares/auth');
// const { refreshAuth } = require('../middlewares/refreshAuth');

// const Password = require('../controllers/password');
// const validate = require('../middlewares/validate');

// router.get('/', (req, res) => {
// 	console.log(req.headers.host + req.originalUrl);
// 	res.status(200).json({
// 		message: 'working',
// 	});
// });

// router.post('/register', validate, Auth.register);

router.get('/joe-tokenlists', backendApi.joeTokenlists);
router.get('/covalent/tokenBalancesByAddress/:address', backendApi.getTokenBalancesByAddress);
router.get('/covalent/portfolioByAddress/:address', backendApi.getPortfolioByAddress);
// router.get('/', backendApi.joeTokenlists);

// //EMAIL Verification
// router.post('/verify/', Auth.verify);
// router.post('/resend', Auth.resendToken);

// //Password RESET
// router.post('/recover', Password.recover);

// // router.get('/reset/:token', Password.reset);

// router.post('/checkResetToken/', Password.checkResetToken);
// router.put('/changePassword', auth, Password.changePassword);

// router.post('/reset', Password.resetPassword);

// router.post('/refreshToken', refreshAuth, Auth.refreshToken);

module.exports = router;
//https://api.covalenthq.com/v1/43114/address/0x3A0060f7e429e6a8c217B8229d232E8Da506aa57/balances_v2/?key=ckey_dd1097227f0a4afb8681cc4a65c&quote-currency=USD&no-nft-fetch=true