const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  candidateName: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // 其他候选人相关信息字段
});

const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;
