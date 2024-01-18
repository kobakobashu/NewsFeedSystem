const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require("axios");
const mongoose = require('mongoose');
const Query = require('./models/query');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const handleEvent = async (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;

    const posts = new Query({
      id,
      title,
      comments: []
    });

    await posts.save();
  }

  if (type === "CommentCreated") {
    const { id, content, postId, status } = data;

    const comment = {
      id: id,
      content: content,
      status: status
    };

    try {
      await Query.findOneAndUpdate(
        { id: postId },
        { $push: { comments: comment } },
        { new: true }
      )
    } catch (err) {
      console.error(err);
    };

    const posts = await Query.find({});
  }

  if (type === "CommentUpdated") {
    const { id, content, postId, status } = data;
    try {
      await Query.findOneAndUpdate(
        { id: postId, 'comments.id': id },
        { $set: { 'comments.$.status': status, 'comments.$.content': content } },
        { new: true }
      )
    } catch (err) {
      console.error(err);
    };
  }
};

app.get('/posts', async (req, res) => {
  const posts = await Query.find({});
  res.send(posts);
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  res.send({});
});

app.listen(4002, async () => {
  try {
    await mongoose.connect('mongodb://posts-mongo-srv:27017/query');
    console.log('Connected to mongo');
  } catch (err) {
    console.error(err);
  }
  console.log('Listening on 4002');
  try {
    const res = await axios.get("http://event-bus-srv:4005/events");

    for (let event of res.data) {
      console.log("Processing event:", event.type);

      handleEvent(event.type, event.data);
    }
  } catch (error) {
    console.log(error.message);
  }
});
