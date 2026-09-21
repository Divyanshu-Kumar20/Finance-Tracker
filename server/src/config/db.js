const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    console.log("====================================");
    console.log("Connecting to MongoDB...");
    console.log("====================================");

    try {
      const connection = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000,
      });

      console.log("====================================");
      console.log("✅ MongoDB Connected Successfully to Cloud Atlas!");
      console.log("Host:", connection.connection.host);
      console.log("====================================");
      return;
    } catch (cloudErr) {
      console.warn("⚠️ Could not connect to MongoDB Atlas cloud URI:", cloudErr.message);
      console.log("⚡ Starting local MongoMemoryServer fallback...");

      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      const localUri = mongod.getUri();

      const connection = await mongoose.connect(localUri);
      console.log("====================================");
      console.log("✅ Local In-Memory MongoDB Connected Successfully!");
      console.log("URI:", localUri);
      console.log("====================================");
    }

  } catch (error) {
    console.log("\n====================================");
    console.log("❌ MongoDB Connection Error:", error.message);
    console.log("====================================");
    process.exit(1);
  }
};

module.exports = connectDB;