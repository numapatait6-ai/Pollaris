const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },
  optionText: {
    type: String,
    required: true
  },
  voterIpHash: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

//  one vote per IP per poll
voteSchema.index({ pollId: 1, voterIpHash: 1 }, { unique: true });
//  one vote per session per poll
voteSchema.index({ pollId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);