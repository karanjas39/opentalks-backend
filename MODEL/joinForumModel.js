const mongoose = require("mongoose");

const joinForumSchema = {
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
  adminId: {
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "user",
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
};

const joinForum = mongoose.model("join_forum", joinForumSchema);

module.exports = joinForum;
