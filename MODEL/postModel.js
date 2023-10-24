const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  forumId: {
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "forum",
  },
  userId: {
    //ObjectID of person who created the post
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "user",
  },
  active: {
    type: Boolean,
    default: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
});

const post = mongoose.model("post", postSchema);

module.exports = post;
