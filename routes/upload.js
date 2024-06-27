const express = require('express');
const multer = require('multer');
const { put } = require('@vercel/blob');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const Avatar = require('../models/Avatar');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/avatars', upload.single('avatar'), async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    console.log(username, email);
    const timestamp = Date.now();
    const originalname = req.file.originalname;
    const extension = path.extname(originalname);
    const filename = `${username}-${timestamp}${extension}`;

    if (!req.file) {
      return res.status(400).send('没有上传文件');
    }

    // 查询用户
    const user = await User.findOne({ username });
    console.log(user);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null,
      });
    }

    // 使用 req.file.buffer 获取文件内容
    const blob = await put(filename, req.file.buffer, {
      access: 'public',
    });

    // 查找用户是否已有头像记录
    let avatar = await Avatar.findOne({ userId: user._id });
    avatar.imagePath = blob.url;
    // 保存头像记录到数据库
    await avatar.save();

    res.status(200).json(blob);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
  }
});

module.exports = router;
