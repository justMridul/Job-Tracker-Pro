"use strict";

const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || process.env.ACCESS_TOKEN_SECRET;

const verifyAccessToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Access token required" });
    }

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = { id: decoded.sub, role: decoded.role || "user" };
    next();
  } catch (err) {
    console.error("Access token verification failed:", err);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = verifyAccessToken;
