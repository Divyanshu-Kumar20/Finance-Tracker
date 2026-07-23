const mongoose = require("mongoose");
const dns = require("dns");

// Set reliable public DNS servers to resolve MongoDB Atlas SRV records (queryTxt ETIMEOUT fix)
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Fallback if setServers is restricted
}

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    console.log("====================================");
    console.log("Connecting to MongoDB...");
    console.log(
      "Mongo URI:",
      process.env.MONGO_URI.replace(/\/\/.*?:.*?@/, "//<username>:<password>@")
    );
    console.log("====================================");

    const connection = await mongoose.connect(process.env.MONGO_URI, {
      family: 4,                      // Force IPv4
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });

    console.log("====================================");
    console.log("✅ MongoDB Connected Successfully!");
    console.log("Host:", connection.connection.host);
    console.log("Database:", connection.connection.name);
    console.log("Ready State:", mongoose.connection.readyState);
    console.log("====================================");

  } catch (error) {
    console.log("\n====================================");
    console.log("❌ MongoDB Connection Failed");
    console.log("====================================");
    console.log("Name:", error.name);
    console.log("Message:", error.message);
    console.log("Code:", error.code);
    console.log("Stack:\n", error.stack);
    console.log("====================================");

    process.exit(1);
  }
};

module.exports = connectDB;