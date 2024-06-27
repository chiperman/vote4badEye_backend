const jwt = require('jsonwebtoken');

const secretKey = process.env.SECRET_KEY;

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, secretKey, (err, decodedToken) => {
      if (err) {
        return res.status(403).json({ code: 403, message: '身份验证失败，请重新登录！' });
      } else {
        req.decodedToken = decodedToken; // 将解码后的用户信息附加到请求对象上
        next();
      }
    });
  } else {
    return res.status(401).json({ code: 401, message: '身份验证失败，请重新登录！' });
  }
};

module.exports = { requireAuth };
