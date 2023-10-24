const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "user",
  },
  message: {
    type: String,
    default: "",
  },
  forAdmin: {
    type: Boolean,
    default: false,
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

/*1> When user want to contact admin then 'userId' field will reflect the user who want to contact admin and 'forAdmin' will be true
2> Whereas else the 'userId' reflect the user for whom notification is created and 'forAdmin' will be false*/

const notification = mongoose.model("notification", notificationSchema);

module.exports = notification;
