const jwt = require('jsonwebtoken');
const { REFRESH_TOKEN_SECRET } = process.env;
const {
  ERROR_REFRESH_TOKEN_REQUIRED,
  ERROR_INVALID_REFRESH_TOKEN,
  ERROR_REFRESH_TOKEN_EXPIRED,
} = require('../const/const');

exports.refreshAuth = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken || req.query.refreshToken || req.headers.refreshToken;

    if (!refreshToken) {
      return res.status(401).send({ message: ERROR_REFRESH_TOKEN_REQUIRED });
    }
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).send({ message: ERROR_REFRESH_TOKEN_EXPIRED });
      }
      return res.status(401).send({ message: ERROR_INVALID_REFRESH_TOKEN });
    }
  } catch (error) {
    res.status(401).send({ error, message: ERROR_INVALID_REFRESH_TOKEN });
  }
};
