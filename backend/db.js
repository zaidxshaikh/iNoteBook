const mongoose = require("mongoose");
const mongoUrl = process.env.MONGO_URI || "mongodb://localhost:27017/";

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectToMongo;
