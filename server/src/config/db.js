const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const mongoUri = process.env.MONGO_URI || "mongodb+srv://divyanshupraja2004_db_userss:Finance12345@finance-tracker-cluster.40sxzzt.mongodb.net/finance-tracker?retryWrites=true&w=majority";

  try {
    const db = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("====================================");
    console.log("✅ MongoDB Connected Successfully!");
    console.log("====================================");
  } catch (err) {
    console.warn("⚠️ Cloud MongoDB Connection Warning:", err.message);
    if (process.env.NODE_ENV !== "production") {
      try {
        const { MongoMemoryServer } = require("mongodb-memory-server");
        const mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri());
        console.log("✅ Local In-Memory MongoDB Connected!");
      } catch (memErr) {
        console.error("Memory server fallback error:", memErr.message);
      }
    }
  }
};

module.exports = connectDB;