// Backend/Utils/password.js
const bcrypt = require('bcryptjs');

const ROUNDS = 12;

async function hashPassword(plain) {
  if (typeof plain !== 'string' || plain.length < 6) {
    throw new Error('Password must be a string of at least 6 characters');
  }
  return bcrypt.hash(plain, ROUNDS);
}

function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
