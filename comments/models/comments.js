const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: false
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    required: true
  }
}, {
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const Comments = mongoose.model('Comments', commentsSchema);

module.exports = Comments;