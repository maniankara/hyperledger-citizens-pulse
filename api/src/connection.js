const mongoose = require("mongoose");
const User = require("./user.model");
const connection = "mongodb://localhost:27017/mongo-votes";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connectDb = () => {
  return mongoose.connect(connection, options);
};

module.exports = connectDb;
