const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const Comments = require('./models/comments');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const start = async () => {
  try {
    await mongoose.connect('mongodb://comments-mongo-srv:27017/comments');
    console.log('Connected to mongo');
  } catch (err) {
    console.error(err);
  };

  app.listen(4001, () => {
    console.log('Listening on 4001');
  });  
};

app.post('/posts/:id/comments', async (req, res) => {
  const { content } = req.body;

  const comment = new Comments({ content, status: 'pending', postId: req.params.id });
  await comment.save();

  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: comment.toJSON().id,
      content: comment.toJSON().content,
      postId: req.params.id,
      status: comment.toJSON().status
    }
  })

  res.status(201).send(comment);
});

app.post("/events", async (req, res) => {
  console.log("Received Event", req.body.type);

  const { type, data } = req.body;

  if (type === "CommentModerated") {
    const { id, content, postId, status } = data;
    
    const comment = await Comments.findById(id);

    comment.status = status;
    await comment.save();

    await axios.post("http://event-bus-srv:4005/events", {
      type: "CommentUpdated",
      data: {
        id,
        status,
        postId,
        content,
      },
    });
  }

  if (type === "PostDeleted") {
    const { id } = data;
    await Comments.deleteMany({ postId: id })
  }

  res.send({});
});

start();