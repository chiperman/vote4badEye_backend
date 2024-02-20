const mongoose = require('mongoose');

const avatarSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
});

// 创建头像集合模型
const Avatar = mongoose.model('Avatar', avatarSchema);

module.exports = Avatar;
