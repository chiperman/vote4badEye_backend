require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { requireAuth } = require('./middleware/authMiddleware');

const app = express();
const port = 3000;

connectDB();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:8080', credentials: true }));
app.use(cookieParser());

// 设置静态文件目录
app.use('/uploads', express.static('uploads'));

// 引入路由文件
app.use('/api', require('./routes/user'));
app.use('/api', require('./routes/candidates'));

// 在使用路由之前应用 requireAuth 中间件
app.use('/api', requireAuth, require('./routes/vote'));
app.use('/api', requireAuth, require('./routes/uploadAvatar'));

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});