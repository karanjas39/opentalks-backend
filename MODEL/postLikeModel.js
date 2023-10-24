const mongoose = require("mongoose");

const postlikeSchema = mongoose.Schema({
  postId: {
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "post",
  },
  userId: {
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "user",
  },
  forumId: {
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "forum",
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postLike = mongoose.model("post_like", postlikeSchema);

module.exports = postLike;
