const mongoose = require("mongoose");
const mongoUrl = "mongodb://localhost:27017/";

const connectToMongo = () => {
  mongoose.connect(mongoUrl, console.log("Connected to MongoDB successfully!"));
};

module.exports = connectToMongo;
