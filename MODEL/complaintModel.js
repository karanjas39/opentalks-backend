const mongoose = require("mongoose");
const uuid = require("uuid");

const complaintSchema = mongoose.Schema({
  // Who complained
  userId: {
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "user",
  },
  adminId: {
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "user",
  },
  complaint_number: {
    type: String,
    default: function () {
      const uniqueId = uuid.v4().replace(/-/g, "");
      return "#" + uniqueId + "OpenTalks";
    },
  },
  forumId: {
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "forum",
  },
  complaint: {
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
  isResponded: {
    type: Boolean,
    default: false,
  },
});

const complaint = mongoose.model("complaint", complaintSchema);

module.exports = complaint;
