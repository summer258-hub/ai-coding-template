const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment.');
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '24h';

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: '未提供认证令牌' }
    });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = userModel.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '用户不存在' }
      });
    }
    
    req.userId = user.id;
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: '认证令牌无效或已过期' }
    });
  }
}

module.exports = { generateToken, authMiddleware, JWT_SECRET, JWT_EXPIRES_IN };