const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES_IN = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_TTL || '7d';

function signAccessToken(user) {
  if (!ACCESS_SECRET) throw new Error('JWT_ACCESS_SECRET not set');
  const sub = String(user.id || user._id);
  return jwt.sign({ sub, role: user.role }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

function signRefreshToken(user, jti) {
  if (!REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET not set');
  const sub = String(user.id || user._id);
  return jwt.sign({ sub, jti }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

function verifyAccess(token) {
  if (!ACCESS_SECRET) throw new Error('JWT_ACCESS_SECRET not set');
  return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefresh(token) {
  if (!REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET not set');
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccess,
  verifyRefresh,
};
