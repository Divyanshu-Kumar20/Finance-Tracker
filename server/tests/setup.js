const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

jest.setTimeout(30000);

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key-12345";
  process.env.NODE_ENV = "test";

  try {
    mongoServer = await MongoMemoryServer.create({
      binary: {
        checkMD5: false,
      },
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  } catch (err) {
    const mongoUri = process.env.MONGO_URI;
    if (mongoUri) {
      await mongoose.connect(mongoUri, { family: 4 });
    } else {
      throw err;
    }
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      if (key === "users") {
        await collections[key].deleteMany({ email: { $regex: /@example\.com$/i } });
      } else if (key === "transactions") {
        await collections[key].deleteMany({ name: { $regex: /Salary|Rent|Groceries|Laptop|Updated|Test/i } });
      } else {
        await collections[key].deleteMany({});
      }
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    if (!mongoServer) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        if (key === "users") {
          await collections[key].deleteMany({ email: { $regex: /@example\.com$/i } });
        } else if (key === "transactions") {
          await collections[key].deleteMany({ name: { $regex: /Salary|Rent|Groceries|Laptop|Updated|Test/i } });
        }
      }
    }
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
