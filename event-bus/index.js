const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
const mongoose = require('mongoose');
const Events = require('./models/event-bus');

const start = async () => {
  try {
    await mongoose.connect('mongodb://event-bus-mongo-srv:27017/event-bus');
    console.log('Connected to mongo');
  } catch (err) {
    console.error(err);
  };

  app.listen(4005, () => {
    console.log("Listening on 4005");
  });
};

app.post("/events", async (req, res) => {
  const event = new Events({ type: req.body.type, data: req.body.data });
  await event.save();

  axios.post("http://posts-clusterip-srv:4000/events", event).catch((err) => {
    console.log(err.message);
  });
  axios.post("http://comments-srv:4001/events", event).catch((err) => {
    console.log(err.message);
  });
  axios.post("http://query-srv:4002/events", event).catch((err) => {
    console.log(err.message);
  });
  axios.post("http://moderation-srv:4003/events", event).catch((err) => {
    console.log(err.message);
  });
  res.send({ status: "OK" });
});

app.get("/events", async (req, res) => {
  const events = await Events.find({});
  res.send(events);
});

start();