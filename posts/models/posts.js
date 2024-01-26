const mongoose = require("mongoose");

const postsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    required: true
  },
}, {
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const Posts = mongoose.model('Posts', postsSchema);

module.exports = Posts;