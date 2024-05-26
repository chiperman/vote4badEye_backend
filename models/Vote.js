const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  badEye: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
  },
  reason: {
    type: String,
  },
  voteDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
