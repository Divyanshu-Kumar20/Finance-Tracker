const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

dotenv.config();

const demoUser = {
  name: "Demo User",
  email: "demo@financetracker.local",
  password: "DemoPass123!",
};

const demoTransactions = [
  {
    name: "Salary",
    amount: 45000,
    type: "income",
    category: "Employment",
    date: "2026-05-01",
  },
  {
    name: "Rent payment",
    amount: 12000,
    type: "expense",
    category: "Rent",
    date: "2026-05-03",
  },
  {
    name: "Petrol",
    amount: 1200,
    type: "expense",
    category: "Transport",
    date: "2026-05-05",
  },
  {
    name: "Freelance project",
    amount: 7000,
    type: "income",
    category: "Side Income",
    date: "2026-05-08",
  },
  {
    name: "Myntra order",
    amount: 2800,
    type: "expense",
    category: "Shopping",
    date: "2026-05-11",
  },
  {
    name: "Groceries",
    amount: 3500,
    type: "expense",
    category: "Food",
    date: "2026-05-12",
  },
];

const seed = async () => {
  await connectDB();

  const passwordHash = await bcrypt.hash(demoUser.password, 10);
  const user = await User.findOneAndUpdate(
    { email: demoUser.email },
    {
      name: demoUser.name,
      email: demoUser.email,
      passwordHash,
    },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  );

  await Transaction.deleteMany({ user: user._id });
  await Transaction.insertMany(
    demoTransactions.map((transaction) => ({
      ...transaction,
      user: user._id,
    }))
  );

  console.log("Demo data seeded");
  console.log(`Email: ${demoUser.email}`);
  console.log(`Password: ${demoUser.password}`);
  console.log(`Transactions: ${demoTransactions.length}`);
};

seed()
  .catch((error) => {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
