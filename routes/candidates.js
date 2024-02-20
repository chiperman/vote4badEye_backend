const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const Avatar = require('../models/Avatar');

// 获取参赛人员信息的路由
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find();

    // 使用 Promise.all 并发查询所有参赛人员的头像信息
    const avatarPromises = candidates.map(async (candidate) => {
      const avatar = await Avatar.findOne({ userId: candidate.userId });
      return {
        userId: candidate.userId,
        username: candidate.candidateName,
        imagePath: avatar ? avatar.imagePath : null,
      };
    });

    // 等待所有头像信息查询完成
    const formattedCandidates = await Promise.all(avatarPromises);

    res.status(200).json({
      code: 200,
      message: '成功获取参赛人员信息',
      data: formattedCandidates,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null,
    });
  }
});

module.exports = router;
