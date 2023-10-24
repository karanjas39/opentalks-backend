const mongoose = require("mongoose");

const forumSchema = mongoose.Schema({
  name: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  departmentId: {
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "department",
  },
  userId: {
    // ObjectId of the user who created the forum
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "user",
    immutable: true,
  },
  joinRequests: [
    {
      userId: {
        type: mongoose.Types.ObjectId,
        ref: "user",
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
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

const forum = mongoose.model("forum", forumSchema);

module.exports = forum;
