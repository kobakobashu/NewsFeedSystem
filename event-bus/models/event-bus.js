const mongoose = require("mongoose");

const eventsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['PostCreated', 'PostUpdated', 'PostDeleted', 'CommentCreated', 'CommentModerated', 'CommentUpdated'],
    required: true
  },
  data: {
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: false,
    },
    postId: {
      type: String,
      required: false,
    },
    content: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: false,
    },  
    version: {
      type: Number,
      required: false,
    },  
  },
}, {
  toJSON: {
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
    }
  }
});

const Events = mongoose.model('Events', eventsSchema);

module.exports = Events;