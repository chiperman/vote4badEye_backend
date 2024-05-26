const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Avatar = require('../models/Avatar');
const { createToken } = require('../utils/verify');
const { requireAuth } = require('../middleware/authMiddleware');

maxAge = 60 * 60 * 24 * 365;

const handleErrors = (err) => {
  let errors = { username: '', password: '', email: '' };

  // duplicate email error
  if (err.code === 11000) {
    errors.email = '用户已注册';
    return errors;
  }

  // validation errors
  if (err.message.includes('User validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const user = await User.create({ username, password, email });

    // 创建候选人记录
    let newCandidate;
    try {
      newCandidate = new Candidate({ candidateName: username, userId: user._id });
      await newCandidate.save();
    } catch (candidateErr) {
      res.status(500).json({
        code: 500,
        message: '注册失败',
        data: null,
      });
      return;
    }

    // 创建头像记录
    let newAvatar;
    try {
      newAvatar = new Avatar({
        userId: user._id,
        imagePath: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      });
      await newAvatar.save();
    } catch (avatarErr) {
      res.status(500).json({
        code: 500,
        message: '注册失败',
        data: null,
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: '注册成功',
      data: {
        userId: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({
      code: 400,
      message: '注册失败',
      data: { errors },
    });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ code: 401, message: '邮箱未注册', data: null });
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.status(401).json({ code: 401, message: '密码不正确', data: null });
    }

    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

    // 获取用户头像
    const avatar = await Avatar.findOne({ userId: user._id });

    res.status(200).json({
      code: 200,
      message: '登陆成功',
      data: {
        userId: user._id,
        username: user.username,
        email: user.email,
        avatar: avatar ? avatar.imagePath : null,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: error,
    });
  }
});

router.post('/logout', (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, maxAge: 1 });
  res.status(200).json({ code: 200, message: '退出成功' });
});

router.post('/verifyToken', requireAuth, async (req, res) => {
  // 对这个接口使用 requireAuth 中间件
  res.status(200).json({
    code: 200,
    message: 'Token 验证成功',
    data: { valid: true, decoded: req.decodedToken },
  });
});

module.exports = router;
