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

const allowedOrigins = ['https://vote4badeye.vercel.app', 'http://localhost:8080'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not ' +
                  'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(cookieParser());

// 引入路由文件
app.use('/api', require('./routes/user'));

// 在使用路由之前应用 requireAuth 中间件
app.use('/api', requireAuth, require('./routes/candidates'));
app.use('/api', requireAuth, require('./routes/vote'));
app.use('/api', requireAuth, require('./routes/upload'));

app.listen(port, () => {
  console.log(`服务器运行在端口 port = ${port}`);
});
