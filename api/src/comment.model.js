const mongoose = require("mongoose");

var CommentsSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      default: "",
    },
    plan: {
      type: mongoose.Schema.ObjectId,
      ref: "PlanData",
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);
mongoose.model("Comments", CommentsSchema);
