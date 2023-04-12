const jwt = require('jsonwebtoken');

require('dotenv').config();

const { JWT_SECRET } = process.env;

exports.auth = async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token || req.headers.token;

    if (!token) {
      return res.status(401).send({ message: 'A token is required for authentication' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).send({ message: 'Token expired' });
      }
      return res.status(401).send({ message: 'Invalid Token' });
    }
    return next();
  } catch (error) {
    res.status(401).send({
      error,
      message: 'User session expired, Log in to continue',
    });
  }
};
