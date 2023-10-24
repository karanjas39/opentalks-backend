const mongoose = require("mongoose");

const forumLikeSchema = mongoose.Schema({
  forumId: {
    type: mongoose.Types.ObjectId,
    ref: "forum",
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "user",
  },
  rating: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ForumLike = mongoose.model("forum_like", forumLikeSchema);

module.exports = ForumLike;
