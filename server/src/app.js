const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        !FRONTEND_URL ||
        FRONTEND_URL === "*" ||
        origin === FRONTEND_URL ||
        (typeof FRONTEND_URL === "string" &&
          FRONTEND_URL.split(",").map((s) => s.trim()).includes(origin)) ||
        process.env.NODE_ENV === "test"
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

if (process.env.NODE_ENV !== "test") {
  app.use("/api/auth", authLimiter);
}

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

app.use(errorHandler);

module.exports = app;
