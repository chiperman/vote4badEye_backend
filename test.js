const axios = require('axios');

// 注册
// axios.post('http://localhost:3000/auth/register', {
// 	username: "tony.li2",
// 	password: "123456",
// 	email: "741263942@qq.com",
// }).then((resp) => {
// 	console.log(resp);
// }).catch((err) => {
// 	console.log(err);
// })

let user;

// 获取 token
axios.post('http://localhost:3000/auth/login', {
	password: "123456",
	email: "741263942@qq.com",
}).then((resp) => {
	console.log('data:', resp.data)
	return resp.data
}).then((data) => {
	user = data.data
	const instance = axios.create({
		baseURL: 'http://localhost:3000/',
		headers: {'Authorization': 'Bearer ' + user.token},
	})
	return instance.post('/v/votes', {
		badEye: user.id,
		reason: '烂',
	})
}).then((resp) => {
	console.log('vote resp:', resp)

}).catch((err) => {
	console.log(err);
}).then((data) => {
	console.log("going to get votes")
	const instance = axios.create({
		baseURL: 'http://localhost:3000/',
		headers: {'Authorization': 'Bearer ' + user.token},
	})
	return instance.get('http://localhost:3000/v/votes', {
		params: {
			voterId: user.id,
			voteWeek:  2820,
		}
	})
}).then((resp) => {
	console.log('get votes resp:', resp.data.data)
}).catch((err) => {
	console.log(err)
})
