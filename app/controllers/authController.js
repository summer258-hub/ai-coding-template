const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const { generateToken } = require('../middleware/auth');
const { isValidUsername, isValidEmail, isValidPassword } = require('../utils/validators');

const SALT_ROUNDS = 10;

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    
    if (!isValidUsername(username)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '用户名格式不正确（3-20位字母数字下划线）' }
      });
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '邮箱格式不正确' }
      });
    }
    
    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '密码至少需要6位' }
      });
    }
    
    if (userModel.findByUsername(username)) {
      return res.status(409).json({
        success: false,
        error: { code: 'USERNAME_EXISTS', message: '用户名已被注册' }
      });
    }
    
    if (userModel.findByEmail(email)) {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_EXISTS', message: '邮箱已被注册' }
      });
    }
    
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = userModel.create({ username, email, passwordHash });
    const token = generateToken(user);
    
    res.status(201).json({
      success: true,
      data: { token, user: userModel.toSafeUser(user) },
      message: '注册成功'
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '用户名和密码不能为空' }
      });
    }
    
    let user = userModel.findByUsername(username);
    if (!user) user = userModel.findByEmail(username);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: '用户名或密码错误' }
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: '用户名或密码错误' }
      });
    }
    
    const token = generateToken(user);
    
    res.json({
      success: true,
      data: { token, user: userModel.toSafeUser(user) },
      message: '登录成功'
    });
  } catch (err) {
    next(err);
  }
}

function getCurrentUser(req, res, next) {
  try {
    res.json({
      success: true,
      data: userModel.toSafeUser(req.user)
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getCurrentUser };