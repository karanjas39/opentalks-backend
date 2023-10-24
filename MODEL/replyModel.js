const mongoose = require("mongoose");

const replySchema = mongoose.Schema({
  byWhom: {
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "user",
  },
  postId: {
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "post",
  },
  forumId: {
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "forum",
  },
  message: {
    type: String,
    default: "",
  },
  active: {
    type: Boolean,
    default: true,
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

const reply = mongoose.model("reply", replySchema);

module.exports = reply;
