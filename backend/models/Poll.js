const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },

  options: [{
    text: String,
    _id: false 
  }],

   isClosed: {
    type: Boolean,
    default: false   // poll open by default
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Poll', pollSchema);