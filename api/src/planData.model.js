const mongoose = require("mongoose");
const CommentsSchema = require("./comment.model");

const planDataSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
  },
  comments: [CommentsSchema],
});
const PlanData = mongoose.model("PlanData", planDataSchema);
module.exports = PlanData;
