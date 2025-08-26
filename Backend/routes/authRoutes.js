"use strict";

const express = require("express");
const router = express.Router();

const AuthController = require("../Controllers/authController");
const verifyAccessToken = require("../MiddleWares/verifyAccessToken");

// Simple test route
router.get("/test", (_req, res) => {
  res.json({
    message: "Auth routes working!",
    timestamp: new Date().toISOString(),
    method: "GET",
    path: "/test",
  });
});

// Google OAuth routes
router.post("/google", AuthController.googleAuth);

// Token refresh & logout
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);

// Authenticated route
router.get("/me", verifyAccessToken, AuthController.me);

module.exports = router;
