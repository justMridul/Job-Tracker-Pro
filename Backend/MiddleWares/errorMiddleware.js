"use strict";

const { ValidationError } = require("mongoose").Error;

/* eslint-disable no-unused-vars */
module.exports = (err, req, res, _next) => {
  // Server-side logging (consider integrating Pino/Winston for production)
  console.error("[ERROR]", {
    message: err.message,
    name: err.name,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    user: req.user?.id || null,
    statusCode: err.statusCode || err.status || 500,
    code: err.code,
  });

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal server error";
  let details = err.details;

  // JWT and auth-related common errors normalization
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Not authorized, token invalid";
  }

  // Mongoose validation errors
  if (err instanceof ValidationError) {
    statusCode = 400;
    const msgs = Object.values(err.errors).map((v) => v.message);
    message = msgs.join(", ") || "Validation error";
    details =
      details ||
      Object.entries(err.errors).map(([path, v]) => ({
        field: path,
        message: v.message,
        kind: v.kind,
        value: v.value,
      }));
  }

  // MongoDB duplicate key error (E11000)
  if (err && (err.code === 11000 || err.code === "11000")) {
    statusCode = 409; // Conflict
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for ${field}: ${err.keyValue[field]}`;
    details =
      details || {
        index: err.index,
        keyPattern: err.keyPattern,
        keyValue: err.keyValue,
      };
  }

  // Mongoose bad ObjectId cast
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Invalid ID format";
    details = details || { field: err.path, value: err.value };
  }

  // Final standardized response
  return res.status(statusCode).json({
    success: false,
    error: message,
    details,
  });
};
/* eslint-enable no-unused-vars */
