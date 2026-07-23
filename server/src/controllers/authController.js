const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const userProfile = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: userProfile(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: userProfile(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

const getMe = async (req, res) => {
  res.json({
    user: userProfile(req.user),
  });
};

module.exports = {
  register,
  login,
  getMe,
};
