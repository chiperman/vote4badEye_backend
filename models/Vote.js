const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  badEyeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    required: false,
  },
  voteWeek: {
    type: Number,
    required: true,
  },
  voteTime: {
    type: Date,
    required: true,
  },
});


const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
