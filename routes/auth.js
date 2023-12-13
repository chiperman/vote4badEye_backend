const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

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

    return res.status(200).json({
      code: 200,
      message: '用户注册成功',
      data: {
        userId: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null,
    });
  }
});

// 用户登录路由
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send('用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send('密码错误');
    }

    res.status(200).send('登录成功');
  } catch (error) {
    res.status(500).send('登录失败');
  }
});

module.exports = router;
