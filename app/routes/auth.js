const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: '登录尝试次数过多，请稍后再试' }
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;