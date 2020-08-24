const mongoose = require("mongoose");
const uservoteSchema = new mongoose.Schema(
  {
    hash: {
      type: String,
      required: true,
    },
    choice: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const UserVotes = mongoose.model("UserVotes", uservoteSchema);
module.exports = UserVotes;
