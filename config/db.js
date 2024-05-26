const mongoose = require('mongoose');

const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;
const host = '101.34.82.202:27017';
const database = 'vote4badeye';

const uri = `mongodb://${username}:${password}@${host}/${database}`;

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {});
    console.log('MongoDB 连接成功');
  } catch (error) {
    console.error('MongoDB 连接失败:', error.message);
    process.exit(1); // 如果连接失败，终止应用程序
  }
};

module.exports = connectDB;
