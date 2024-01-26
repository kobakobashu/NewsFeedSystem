const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const Posts = require('./models/posts');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const start = async () => {
  try {
    await mongoose.connect('mongodb://posts-mongo-srv:27017/posts');
    console.log('Connected to mongo');
  } catch (err) {
    console.error(err);
  };

  app.listen(4000, () => {
    console.log('Listening on 4000');
  });
}

app.get('/posts/create', async (req, res) => {
  const posts = await Posts.find({});
  res.send(posts);
});

app.post('/posts/create', async (req, res) => {
  const { title } = req.body;

  const posts = new Posts({ title });
  await posts.save();

  await axios.post('http://event-bus-srv:4005/events', {
    type: 'PostCreated',
    data: {
      id: posts.toJSON().id,
      title: posts.toJSON().title
    }
  });

  res.status(201).send({ posts });
});

app.put('/posts/modify/:id', async (req, res) => {
  const { title } = req.body;

  const post = await Posts.findById(req.params.id);
  post.title = title;
  await post.save();

  await axios.post('http://event-bus-srv:4005/events', {
    type: 'PostUpdated',
    data: {
      id: post.toJSON().id,
      title: post.toJSON().title
    }
  });

  res.status(201).send({ post });
});

app.delete('/posts/delete/:id', async (req, res) => {
  await Posts.deleteOne({_id: req.params.id});

  await axios.post('http://event-bus-srv:4005/events', {
    type: 'PostDeleted',
    data: {
      id: req.params.id,
    }
  });

  res.status(201).send({});
});

app.post("/events", (req, res) => {
  console.log("Received Event", req.body.type);

  res.send({});
});

start();
