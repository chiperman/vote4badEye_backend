const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Avatar = require('../models/Avatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 用户注册路由
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    console.log('register input username=', username, 'password=', password, 'email=', email);

    // 检查邮箱是否已经存在
    const user = await User.findOne({ email });
    if (user) {
      console.log('邮箱已被注册');
      return res.status(200).json({
        code: 400,
        message: '邮箱已被注册',
        data: null,
      });
    }

    // 创建新用户
    const newUser = new User({ username, password, email });
    await newUser.save();

    // 创建候选人记录
    const newCandidate = new Candidate({ candidateName: username, userId: newUser._id });
    await newCandidate.save();

    console.log('用户注册成功');

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
    console.log('login input password=', password, 'email=', email);

    const user = await User.findOne({ email });

    // 判断用户是否存在
    if (!user) {
      return res.status(200).json({
        code: 404,
        message: '用户不存在',
        data: null,
      });
    }

    // 判断用户密码是否正确
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

    // 获取用户头像
    const avatar = await Avatar.findOne({ userId: user._id });

    // 如果登录成功，返回用户的 id、username、email
    res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: avatar ? avatar.imagePath : null,
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
  const authorizationHeader = req.headers['authorization'];
  const token = authorizationHeader && authorizationHeader.split(' ')[1];

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

    // console.log('Token 验证成功', decoded);
    res.status(200).json({
      code: 200,
      message: 'Token 验证成功',
      data: { valid: true, decoded },
    });
  });
});

module.exports = router;
