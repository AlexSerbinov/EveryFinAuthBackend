const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { JWT_SECRET } = process.env;
const {
  ERROR_ACCESS_TOKEN_REQUIRED,
  ERROR_INVALID_ACCESS_TOKEN,
  ERROR_ACCESS_TOKEN_EXPIRED,
} = require('../const/const');

exports.auth = async (req, res, next) => {
  try {
    const accessToken = req.body.token || req.query.token || req.headers.token;

    if (!accessToken) {
      return res.status(401).send({ message: ERROR_ACCESS_TOKEN_REQUIRED });
    }
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET);
      
      // Найдите пользователя по _id
      const user = await User.findById(decoded._id);

      // Проверьте, существует ли пользователь
      if (!user) {
        return res.status(401).send({ message: "Unauthorized" });
      }

      // Установите объект req.user, добавьте все необходимые поля
      req.user = {
        _id: user._id,
        avatar: user.avatar,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        publicProfileBio: user.publicProfileBio,
        isVerified: user.isVerified,
        login: user.login,
        masterNodeAddress: user.masterNodeAddress,
        address: user.address
      };

      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).send({ message: ERROR_ACCESS_TOKEN_EXPIRED });
      }
      return res.status(401).send({ message: ERROR_INVALID_ACCESS_TOKEN });
    }
  } catch (error) {
    res.status(401).send({ error, message: ERROR_INVALID_ACCESS_TOKEN });
  }
};




// const jwt = require('jsonwebtoken');
// const { JWT_SECRET } = process.env;
// const {
//   ERROR_ACCESS_TOKEN_REQUIRED,
//   ERROR_INVALID_ACCESS_TOKEN,
//   ERROR_ACCESS_TOKEN_EXPIRED,
// } = require('../const/const');

// exports.auth = async (req, res, next) => {
//   try {
//     const accessToken = req.body.token || req.query.token || req.headers.token;

//     if (!accessToken) {
//       return res.status(401).send({ message: ERROR_ACCESS_TOKEN_REQUIRED });
//     }
//     try {
//       const decoded = jwt.verify(accessToken, JWT_SECRET);
//       req.user = decoded;
//       return next();
//     } catch (err) {
//       if (err.name === 'TokenExpiredError') {
//         return res.status(401).send({ message: ERROR_ACCESS_TOKEN_EXPIRED });
//       }
//       return res.status(401).send({ message: ERROR_INVALID_ACCESS_TOKEN });
//     }
//   } catch (error) {
//     res.status(401).send({ error, message: ERROR_INVALID_ACCESS_TOKEN });
//   }
// };













// const jwt = require('jsonwebtoken');
// const User = require('../models/user');
// const {
//   ERROR_ACCESS_TOKEN_REQUIRED,
//   ERROR_INVALID_ACCESS_TOKEN,
//   ERROR_REFRESH_TOKEN_REQUIRED,
//   ERROR_REFRESH_TOKEN_EXPIRED,
//   ERROR_INVALID_REFRESH_TOKEN,
//   ERROR_ACCESS_TOKEN_EXPIRED,
// } = require('../const/const');

// require('dotenv').config();

// const { JWT_SECRET, REFRESH_TOKEN_SECRET } = process.env;

// exports.auth = async (req, res, next) => {
//   try {
//     const accessToken = req.body.token || req.query.token || req.headers.token;

//     if (!accessToken) {
//       return res.status(401).send({ message: ERROR_ACCESS_TOKEN_REQUIRED });
//     }
//     try {
//       const decoded = jwt.verify(accessToken, JWT_SECRET);
//       req.user = decoded;
//       return next();
//     } catch (err) {
//       if (err.name === 'TokenExpiredError') {
//         const refreshToken = req.body.refreshToken || req.query.refreshToken || req.headers.refreshToken;
//         if (!refreshToken) {
//           return res.status(403).send({ message: ERROR_REFRESH_TOKEN_REQUIRED });
//         }
//         try {
//           const decodedRefreshToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
//           req.user = decodedRefreshToken;

//           const user = await User.findById(req.user._id);
//           user.generateAccessToken();
//           await user.save();
//           res.set('accessToken', user.accessToken);

//           return next();
//         } catch (err) {
//           if (err.name === 'TokenExpiredError') {
//             return res.status(403).send({ message: ERROR_REFRESH_TOKEN_EXPIRED });
//           }
//           return res.status(401).send({ message: ERROR_INVALID_REFRESH_TOKEN });
//         }
//       }
//       return res.status(401).send({ message: ERROR_INVALID_ACCESS_TOKEN });
//     }
//   } catch (error) {
//     res.status(401).send({
//       error,
//       message: ERROR_ACCESS_TOKEN_EXPIRED,
//     });
//   }
// };
