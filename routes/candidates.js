const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');

// 获取参赛人员信息的路由
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find().populate('userID', 'username');
    console.log('candidates=', candidates);

    const formattedCandidates = candidates.map((candidate) => ({
      userId: candidate.userID._id,
      username: candidate.userID.username,
    }));

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
