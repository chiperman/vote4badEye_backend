const express = require('express');
// jwt 解析中间件
const {expressjwt} = require('express-jwt')

const router = express.Router();
const Vote = require('../models/Vote');

const secretKey = process.env.SECRET_KEY;

router.use(expressjwt({secret: secretKey, algorithms:['HS256']}))


// 返回对应年份对应周某个用户的投票
async function getUserVoteCntThisWeek(userId, week) {
	return await Vote.find({voterId: userId, voteWeek: week})
}

function getPastDay(date) {
	return Math.ceil(date/86400000)
}

function getWeekNumber(date) {
  const currentWeekNumber = Math.ceil((getPastDay(date) + 2)/7);
  return currentWeekNumber;
}

router.post('/votes', async(req, res) => {
	const voteTime = new Date()
	const badEyeId = req.body.badEye;
	const reason = req.body.reason;
	console.log(req)
	const voterId  = req.auth.userId;
	const voteWeek = getWeekNumber(voteTime);

	console.log(voteTime, badEyeId, reason, voterId)

	const votes = await getUserVoteCntThisWeek(voterId, voteWeek)

	console.log("votes is ", votes)
	// magic number here
	if (votes.length >= 3) {
		return res.status(400).json({
			code: 400,
			message : '这周已经投闷了，真的有这么多烂眼儿吗'
		})
	} 

	try {
		const newVote = new Vote({voterId, badEyeId, reason, voteWeek, voteTime})
		await newVote.save()
	} catch(err) {
		return res.status(500).json({
			code: 500,
			message: '投票失败:' + err,
		})

	}

	return res.status(200).json({
		code: 200,
		message: '投票成功',
		data: {voterId, badEyeId, reason, voteWeek, voteTime}
	})
})

router.get('/votes', async(req, res) => {


})

router.use((err, req, res, next) => {
	if (err.name === 'UnauthorizedError') {
		return res.send({
			status: 401,
			message: '无效token',
		})
	}
})

module.exports = router;
