const jwt = require('jsonwebtoken');

const secretKey = process.env.SECRET_KEY;
const maxAge = 60 * 60 * 24 * 365;

function createToken(id) {
  return jwt.sign({ id }, secretKey, {
    expiresIn: maxAge,
  });
}

module.exports = { createToken };
