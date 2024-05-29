const express = require('express');
const router = express.Router();

const Vote = require('../models/Vote');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const { startOfWeek, endOfWeek } = require('date-fns');
const { cs } = require('date-fns/locale');

// 检查用户是否可以进行投票
async function canVote(userId) {
  try {
    const today = new Date();
    let lastFriday = startOfWeek(today, { weekStartsOn: 5 });
    let thisFriday = endOfWeek(today, { weekStartsOn: 5 });

    // 调整日期以确保上周五在当前周之前，本周五在当前周之后
    if (lastFriday > thisFriday) {
      lastFriday = addDays(lastFriday, -7);
    }

    // 查询用户本周的投票记录
    const votes = await Vote.find({
      voter: userId,
      voteDate: { $gte: lastFriday, $lte: thisFriday },
    });

    return votes;
  } catch (error) {
    return error;
  }
}

// 投票接口路由
router.post('/votes', async (req, res) => {
  const { candidateIds } = req.body;
  const userId = req.decodedToken.id;

  // if(candidateId)
  // 如果 candidatesIds 是空数组或者超过 3 个元素，则返回 400 错误
  if (!candidateIds || candidateIds.length === 0 || candidateIds.length > 3) {
    return res.status(400).json({ code: 400, message: '不符合投票规则！' });
  }

  try {
    // 检查用户是否存在
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在！' });
    }

    // 检查用户是否可以进行投票
    const userVoteArray = await canVote(userId);

    if (userVoteArray instanceof Error) {
      return res.status(500).json({ code: 500, message: '服务器错误' });
    }

    if (Array.isArray(userVoteArray) && userVoteArray.length >= 3) {
      return res.status(403).json({ code: 403, message: '您本周已经投过三次票了，请下周再来！' });
    }

    // 遍历传入的候选人列表
    for (const candidateId of candidateIds) {
      // 检查被投票人是否是候选人
      const candidate = await Candidate.findById(candidateId);
      if (!candidate) {
        return res.status(404).json({ code: 400, message: '候选人不存在！' });
      }

      // 检查是否已经给该候选人投过票
      const existingVote = userVoteArray.find((vote) => vote.badEye.toString() === candidateId);
      if (existingVote) {
        return res.status(400).json({ code: 400, message: '您已经给该候选人投过票了！' });
      }

      // 创建投票记录
      const vote = new Vote({
        voter: userId,
        badEye: candidateId,
        voteDate: new Date(), // 添加投票日期
      });

      // 保存投票记录
      try {
        await vote.save();
      } catch (error) {
        console.error('投票记录保存时出现错误：', error);
        return res.status(500).json({ code: 500, message: '投票记录保存时出现错误，请稍后再试！' });
      }
    }

    return res.status(200).json({ code: 200, message: '投票成功！' });
  } catch (error) {
    console.error('投票时出现错误：', error);
    return res.status(500).json({ code: 500, message: '投票时出现错误，请稍后再试！' });
  }
});

// 根据用户 ID 获取投票记录
router.get('/votes', async (req, res) => {
  const userId = req.decodedToken.id;

  try {
    const today = new Date();
    const lastFriday = startOfWeek(today, { weekStartsOn: 5 });
    const thisFriday = endOfWeek(today, { weekStartsOn: 5 });

    // 调整日期以确保上周五在当前周之前，本周五在当前周之后
    if (lastFriday > thisFriday) {
      lastFriday = addDays(lastFriday, -7);
    }

    const votes = await Vote.find({
      voter: userId,
      voteDate: { $gte: lastFriday, $lte: thisFriday },
    }).populate('badEye');
    res.status(200).json({ code: 200, message: '获取投票记录成功', data: votes });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取投票记录时出现错误', data: null });
  }
});

// 根据用户 ID 来分组，获取本次查询周期内所有用户的投票的记录
router.get('/votes/week', async (req, res) => {
  try {
    const today = new Date();
    const lastFriday = startOfWeek(today, { weekStartsOn: 5 });
    const thisFriday = endOfWeek(today, { weekStartsOn: 5 });

    // 调整日期以确保上周五在当前周之前，本周五在当前周之后
    if (lastFriday > thisFriday) {
      lastFriday = addDays(lastFriday, -7);
    }

    // 查询用户在当前查询周期内的所有投票记录，并按用户 ID 分组
    const votes = await Vote.aggregate([
      { $match: { voteDate: { $gte: lastFriday, $lte: thisFriday } } },
      {
        $group: {
          _id: '$voter',
          totalVotes: { $sum: 1 },
          badEyes: { $push: '$badEye' },
        },
      },
      {
        $lookup: {
          from: 'candidates',
          localField: 'badEyes',
          foreignField: '_id',
          as: 'voteList',
        },
      },
      {
        $project: {
          voter: '$_id',
          totalVotes: 1,
          voteList: 1,
          _id: 0,
        },
      },
    ]).allowDiskUse(true);

    res.status(200).json({ code: 200, message: '获取投票记录成功', data: votes });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取投票记录时出现错误', data: null });
  }
});

// 根据 badEye 分组，统计所有的投票纪录
router.get('/votes/total', async (req, res) => {
  try {
    const votes = await Vote.aggregate([
      {
        $group: {
          _id: '$badEye',
          totalVotes: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'candidates',
          localField: '_id',
          foreignField: '_id',
          as: 'badEyeDetails',
        },
      },
      {
        $unwind: '$badEyeDetails',
      },
      {
        $lookup: {
          from: 'avatars',
          localField: 'badEyeDetails.userId',
          foreignField: 'userId',
          as: 'avatarDetails',
        },
      },
      {
        $addFields: {
          'badEyeDetails.imagePath': { $arrayElemAt: ['$avatarDetails.imagePath', 0] },
        },
      },
      {
        $group: {
          _id: '$_id',
          totalVotes: { $first: '$totalVotes' },
          badEyes: { $push: '$badEyeDetails' },
          candidateName: { $first: '$badEyeDetails.candidateName' },
          candidateId: { $first: '$badEyeDetails.userId' },
          imagePath: { $first: '$badEyeDetails.imagePath' },
        },
      },
      {
        $sort: {
          totalVotes: -1,
          candidateName: 1,
        },
      },
      {
        $project: {
          _id: 1,
          totalVotes: 1,
          candidateName: 1,
          candidateId: 1,
          imagePath: 1,
        },
      },
    ]).allowDiskUse(true);

    res.status(200).json({ code: 200, message: '获取投票记录成功', data: votes });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: '获取投票记录时出现错误', data: null });
  }
});

// 根据 badEye 分组，获取本次查询周期内所有用户的投票的记录，然后筛选出获选票数最多的三个 badEye
router.get('/votes/top', async (req, res) => {
  try {
    const today = new Date();
    const lastFriday = startOfWeek(today, { weekStartsOn: 5 });
    const thisFriday = endOfWeek(today, { weekStartsOn: 5 });

    // 调整日期以确保上周五在当前周之前，本周五在当前周之后
    if (lastFriday > thisFriday) {
      lastFriday = addDays(lastFriday, -7);
    }

    // 查询用户在当前查询周期内的所有投票记录，并按用户 ID 分组
    const votes = await Vote.aggregate([
      {
        $match: {
          voteDate: {
            $gte: lastFriday,
            $lte: thisFriday,
          },
        },
      },
      {
        $group: {
          _id: '$badEye',
          totalVotes: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'candidates',
          localField: '_id',
          foreignField: '_id',
          as: 'badEyeDetails',
        },
      },
      {
        $unwind: '$badEyeDetails', // 将 badEyeDetails 拆分成单独的文档
      },
      {
        $lookup: {
          from: 'avatars',
          localField: 'badEyeDetails.userId',
          foreignField: 'userId',
          as: 'avatarDetails',
        },
      },
      {
        $addFields: {
          'badEyeDetails.imagePath': { $arrayElemAt: ['$avatarDetails.imagePath', 0] },
        },
      },
      {
        $group: {
          _id: '$_id',
          totalVotes: { $first: '$totalVotes' },
          badEyes: { $push: '$badEyeDetails' },
          candidateName: { $first: '$badEyeDetails.candidateName' },
          candidateId: { $first: '$badEyeDetails.userId' },
          imagePath: { $first: '$badEyeDetails.imagePath' },
        },
      },
      {
        $sort: {
          totalVotes: -1, // 按 totalVotes 值降序排序
          candidateName: 1, // 按 candidateName 字段升序排序
        },
      },
      {
        $project: {
          _id: 1,
          totalVotes: 1,
          candidateName: 1,
          candidateId: 1,
          imagePath: 1,
        },
      },
    ]).allowDiskUse(true);

    // 处理并列排名的情况
    let topVotes = [];
    let currentRank = 0;
    let previousVotes = -1;

    for (let i = 0; i < votes.length; i++) {
      if (currentRank > 3 && votes[i].totalVotes < previousVotes) {
        break;
      }
      if (votes[i].totalVotes !== previousVotes) {
        previousVotes = votes[i].totalVotes;
        currentRank++;
      }
      if (currentRank <= 3) {
        topVotes.push(votes[i]);
      } else {
        break;
      }
    }

    res.status(200).json({ code: 200, message: '获取投票记录成功', data: topVotes });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: '获取投票记录时出现错误', data: null });
  }
});

module.exports = router;
