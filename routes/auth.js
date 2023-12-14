const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 用户注册路由
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 检查邮箱是否已经存在
    const user = await User.findOne({ email });
    if (user) {
      return res.status(200).json({
        code: 400,
        message: '邮箱已被注册',
        data: null,
      });
    }

    // 创建新用户
    const newUser = new User({ username, password, email });
    await newUser.save();

    res.status(200).json({
      code: 200,
      message: '用户注册成功',
      data: {
        userId: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null,
    });
  }
});

// 用户登录路由
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        code: 404,
        message: '用户不存在',
        data: null,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(200).json({
        code: 401,
        message: '密码错误',
        data: null,
      });
    }

    const secretKey = process.env.SECRET_KEY;

    // 登录成功生成 JWT
    const token = jwt.sign({ userId: user._id, email: user.email }, secretKey, {
      expiresIn: '24h',
    });

    // 如果登录成功，返回用户的 id、username、email
    res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null,
    });
  }
});

// 验证用户 token
router.post('/verifyToken', (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(200).json({
      code: 404,
      message: '未提供 token',
      data: { valid: false },
    });
  }

  const secretKey = process.env.SECRET_KEY;

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error('Token 验证失败', err);
      return res.status(200).json({
        code: 403,
        message: 'Token 验证失败',
        data: { valid: false },
      });
    }

    console.log('Token 验证成功', decoded);
    res.status(200).json({
      code: 200,
      message: 'Token 验证成功',
      data: { valid: true, decoded },
    });
  });
});

module.exports = router;
