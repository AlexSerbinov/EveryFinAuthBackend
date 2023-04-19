const { ERROR_LOGIN_PASSWORD_INVALID, ERROR_USER_NOT_VERIFIED, ERROR_EMAIL_TAKEN, ERROR_LOGIN_TAKEN, ERROR_NO_USER, ERROR_TOKEN_INVALID, ERROR_OLD_PASSWORD_INVALID, ERROR_PASSWORD_NOT_MATCH, ERROR_USER_ALREADY_VERIFIED } = require('../const/const.js');
const User = require("../models/user");
// const WatchList = require('../models/watchList');


module.exports = async (req, res, next) => {
	// let token = req.headers.authorization;
    // if (token.substr(0, 7) === "Bearer ") token = token.substr(7);
    // const user = await User.findOne({ token });
    // if (!user) return res.status(401).json({ message: ERROR_NO_USER });
    // if (Date.now() - user.jwtCreatedAt > TOKEN_LIFE) return res.status(401).json({ message: ERROR_ACCESS_TOKEN_EXPIRED });
	// next();
	// });
}
