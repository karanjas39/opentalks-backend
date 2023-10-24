const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    default: "",
  },
  registration_number: {
    type: Number,
    default: 0,
  },
  email: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "/user-profile-pic/default.png",
  },
  password: {
    type: String,
    default: "",
  },
  departmentId: {
    type: mongoose.Types.ObjectId,
    default: null,
    ref: "department",
  },
  admin: {
    type: Boolean,
    default: false,
    immutable: true,
  },
  lastLogin: {
    type: Date,
    default: null,
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

const user = mongoose.model("user", userSchema);

module.exports = user;
