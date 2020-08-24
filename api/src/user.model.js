const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    trim: true,
  },
  org: {
    type: String,
  },
  cert: {
    type: Object,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
