const mongoose = require("mongoose");

const departmentSchema = mongoose.Schema({
  name: {
    type: String,
    default: "",
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

const department = mongoose.model("department", departmentSchema);

module.exports = department;
