const crypto = require('crypto');

function generateToken() {
  return crypto.randomBytes(24).toString('hex').toUpperCase();
}

module.exports = generateToken;
