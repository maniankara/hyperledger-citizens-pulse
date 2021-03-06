const mongoose = require("mongoose");
const connection = "mongodb://localhost:27017/citizen-pulse";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connectDb = () => {
  return mongoose.connect(connection, options);
};

module.exports = connectDb;
