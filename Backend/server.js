"use strict";

require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// Enable trust proxy for reverse proxy headers
app.set('trust proxy', process.env.TRUST_PROXY || 1);

/**
 * Environment
 */
const PORT = Number(process.env.PORT) || 5000; // FIXED: Changed from 4000 to match your setup
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// Optional email verification flag
const SKIP_EMAIL_VERIFICATION = process.env.SKIP_EMAIL_VERIFICATION === "true";

/**
 * Core middleware
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Make skipEmailVerification available in request
app.use((req, _res, next) => {
  req.skipEmailVerification = SKIP_EMAIL_VERIFICATION;
  next();
});

// CORS configuration
const corsOptions = {
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

/**
 * Security headers
 */
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  })
);

/**
 * Logging
 */
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/**
 * Rate limiting
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  skip: () => process.env.NODE_ENV === "development",
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many API requests, please try again later." },
  skip: () => process.env.NODE_ENV === "development",
});

/**
 * Health check
 */
app.get("/health", (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

/**
 * Routes
 */
if (process.env.NODE_ENV === "production") {
  app.use("/auth", authLimiter);
}
app.use("/auth", require("./routes/authRoutes"));

if (process.env.NODE_ENV === "production") {
  app.use("/api", apiLimiter);
}
app.use("/api/jobs", require("./routes/jobRoutes"));

// Optional legacy applications route
const fs = require("fs");
if (fs.existsSync(path.join(__dirname, "routes/applicationRoutes.js"))) {
  app.use("/api/applications", require("./routes/applicationRoutes")); // FIXED: Added /api prefix
}

/**
 * 404 handler
 */
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

/**
 * Global error handler
 */
app.use((err, _req, res, _next) => {
  console.error("Global error handler:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ success: false, error: "Invalid ID format" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, error: "Duplicate entry" });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

/**
 * Mongoose connection events
 */
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});
mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

/**
 * Graceful shutdown
 */
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await mongoose.connection.close();
  process.exit(0);
});
process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await mongoose.connection.close();
  process.exit(0);
});

/**
 * Start server
 */
(async () => {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI/MONGO_URI in environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 CORS origin: ${CORS_ORIGIN}`);
      console.log(`🛣️ Available routes:`);
      console.log(` - GET  /health`);
      console.log(` - POST /auth/google`); // FIXED: Updated route info
      console.log(` - GET  /auth/me`);
      console.log(` - POST /auth/refresh`);
      console.log(` - POST /auth/logout`);
      console.log(` - GET  /api/jobs`);
      console.log(` - POST /api/jobs`);
      console.log(` - GET  /api/jobs/:id`);
      console.log(` - PUT  /api/jobs/:id`);
      console.log(` - DELETE /api/jobs/:id`);
    });
  } catch (err) {
    console.error("❌ Server startup error:", err);
    process.exit(1);
  }
})();

module.exports = app;
