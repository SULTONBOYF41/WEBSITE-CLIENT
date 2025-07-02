// server/middleware/auth.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Token yo‘q' });
  try {
    const decoded = jwt.verify(token, 'secret_key');
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ msg: 'Token noto‘g‘ri' });
  }
}

module.exports = authMiddleware;
