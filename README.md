# Vote For Bad Eye - 后端

这是 “Vote For Bad Eye” 应用的后端服务，基于 Node.js 和 Express 构建。它提供了一套完整的 RESTful API，用于处理用户认证、投票、候选人管理和数据统计等功能。

## ✨ 功能特性

- **用户认证**: 
  - 使用 JWT (JSON Web Tokens) 进行安全的用户注册和登录。
  - 通过 cookie 进行会话管理。
  - 提供 token 验证中间件保护敏感路由。
- **候选人管理**:
  - 用户注册后自动成为候选人。
  - 提供获取所有候选人列表的接口。
- **投票系统**:
  - 用户可以对候选人进行投票，每周期内有投票次数限制。
  - 投票记录与用户和投票周期关联。
- **头像上传**:
  - 支持用户上传和更新个人头像。
  - 集成 Vercel Blob 进行文件存储。
- **数据统计**:
  - **本周排名**: 实时计算并提供当前投票周期内得票最高的候选人。
  - **历史总计**: 聚合所有历史投票数据，提供总排名。
- **数据库集成**: 使用 Mongoose 与 MongoDB 数据库进行交互，定义了清晰的数据模型。

## 🚀 技术栈

- **Node.js**: JavaScript 运行时环境。
- **Express**: Node.js 的 Web 应用框架。
- **MongoDB**: 一个面向文档的 NoSQL 数据库。
- **Mongoose**: 用于 MongoDB 的优雅对象数据建模库。
- **JSON Web Token (JWT)**: 用于创建访问令牌，实现无状态认证。
- **Bcrypt.js**: 用于密码哈希，增强安全性。
- **Multer**: 用于处理 `multipart/form-data` 的中间件，主要用于文件上传。
- **Vercel Blob**: 用于云端文件存储。
- **date-fns**: 用于处理日期的现代 JavaScript 工具库。

## 📦 安装与设置

1.  **克隆项目**
    ```bash
    git clone https://github.com/your-username/vote4badEye_backend.git
    cd vote4badEye_backend
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **配置环境变量**
    
    在项目根目录下创建一个 `.env` 文件，并参考 `.env.example` 添加必要的环境变量。
    ```env
    # MongoDB 连接字符串
    MONGO_URI=your_mongodb_connection_string

    # JWT 密钥
    JWT_SECRET=your_jwt_secret

    # Vercel Blob 存储的读写令牌
    BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
    ```

## 🛠️ 使用方法

### 开发环境

使用 `nodemon` 启动开发服务器，文件更改时会自动重启。

```bash
npm run dev
```

### 生产环境

启动应用。

```bash
npm start
```

##  API 端点

所有端点都以 `/api` 为前缀。

### 用户认证

- `POST /register`: 注册新用户。
- `POST /login`: 用户登录，成功后返回 JWT cookie。
- `POST /logout`: 用户登出，清除 JWT cookie。
- `POST /verifyToken`: **(需认证)** 验证当前用户的 JWT 是否有效。

### 候选人

- `GET /candidates`: **(需认证)** 获取所有候选人及其头像信息。

### 投票

- `POST /votes`: **(需认证)** 提交投票（可一次投多个候选人）。
- `GET /votes`: **(需认证)** 获取当前用户在本周期的投票记录。
- `GET /votes/top`: **(需认证)** 获取本周投票排名。
- `GET /votes/total`: **(需- 认证)** 获取所有候选人的历史总票数排名。

### 文件上传

- `POST /avatars`: **(需认证)** 上传用户头像。

## 📁 项目结构

```
vote4badEye_backend/
├── config/           # 配置文件 (数据库连接)
│   └── db.js
├── middleware/       # Express 中间件
│   └── authMiddleware.js
├── models/           # Mongoose 数据模型
│   ├── Avatar.js
│   ├── Candidate.js
│   ├── User.js
│   └── Vote.js
├── routes/           # API 路由
│   ├── candidates.js
│   ├── upload.js
│   ├── user.js
│   └── vote.js
├── utils/            # 工具函数
│   └── verify.js
├── .env.example      # 环境变量示例
├── app.js            # 应用主入口
├── package.json
└── README.md
```

## 🤝 贡献

欢迎提交问题和合并请求。对于重大更改，请先打开一个问题进行讨论。
