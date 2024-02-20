const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Avatar = require('../models/Avatar');

const router = express.Router();

// 创建上传文件目录
const uploadDirectory = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const username = req.body.username;
    const timestamp = Date.now();
    const newFileName = `${username}-${timestamp}${path.extname(file.originalname)}`;
    cb(null, newFileName); // 为上传的文件生成新的文件名
  },
});
const upload = multer({ storage: storage });

// 上传文件的路由
router.post('/uploadAvatar', upload.single('avatar'), async (req, res) => {
  try {
    // 获取上传的文件路径
    const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;

    // 获取用户信息
    const username = req.body.username;

    // 查询用户
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null,
      });
    }

    // 查找用户是否已有头像记录
    let avatar = await Avatar.findOne({ userId: user._id });

    // 如果用户已有头像记录，则删除旧的头像文件
    if (avatar && avatar.imagePath) {
      const oldImagePath = path.join(__dirname, '../uploads', path.basename(avatar.imagePath));
      fs.unlinkSync(oldImagePath); // 删除文件
    }

    // 如果用户已有头像记录，则更新头像路径；否则创建新的头像记录
    if (avatar) {
      avatar.imagePath = fileUrl;
    } else {
      avatar = new Avatar({
        userId: user._id,
        imagePath: fileUrl,
      });
    }

    // 保存头像记录到数据库
    await avatar.save();

    // 返回成功响应
    res.status(200).json({
      code: 200,
      message: '头像上传成功！',
      data: {
        fileUrl: fileUrl,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null,
    });
  }
});

module.exports = router;
