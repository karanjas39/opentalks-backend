const mongoose = require("mongoose");

let allowedUsersSchema = mongoose.Schema({
  registration_number: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

let allowedUserModel = mongoose.model("allowed_user", allowedUsersSchema);

module.exports = allowedUserModel;
