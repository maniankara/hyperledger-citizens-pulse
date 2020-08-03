const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  hash: "string",
  choice: "string",
});
const User = mongoose.model("User", userSchema);
module.exports = User;
