const mongoose = require("mongoose");

const responseSchema = mongoose.Schema({
  complaintId: {
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "complaint",
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
  response: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const response = mongoose.model("response", responseSchema);

module.exports = response;
