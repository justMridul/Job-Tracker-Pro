"use strict";

const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const User = require("../models/User");

// ENV values
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || "7d";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Initialize Google OAuth client
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helpers
const generateAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role || "user" }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });

const generateRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role || "user" }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  });

const AuthController = {
  // Google OAuth Login/Register
  googleAuth: async (req, res) => {
    try {
      const { credential } = req.body;

      if (!credential) {
        return res.status(400).json({
          success: false,
          message: "Google credential is required"
        });
      }

      // Verify the Google token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email, name, picture } = payload;

      // Check if user already exists
      let user = await User.findOne({ 
        $or: [
          { email: email.toLowerCase() },
          { googleId }
        ]
      });

      if (!user) {
        // Create new user
        user = await User.create({
          googleId,
          name,
          email: email.toLowerCase(),
          profilePicture: picture,
          role: "user",
          isVerified: true, // Google accounts are pre-verified
        });
      } else if (!user.googleId) {
        // Update existing email user with Google ID
        user.googleId = googleId;
        user.profilePicture = picture;
        user.isVerified = true;
        await user.save();
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      return res.json({
        success: true,
        message: "Google authentication successful",
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          profilePicture: user.profilePicture,
          isVerified: user.isVerified,
        },
      });

    } catch (err) {
      console.error("Google auth error:", err);
      return res.status(500).json({
        success: false,
        message: "Google authentication failed"
      });
    }
  },

  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.body || {};

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Missing refresh token"
        });
      }

      jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ success: false, message: "Invalid refresh token" });

        const accessToken = jwt.sign(
          { sub: decoded.sub, role: decoded.role || "user" },
          ACCESS_TOKEN_SECRET,
          { expiresIn: ACCESS_TOKEN_TTL }
        );

        return res.json({ success: true, accessToken });
      });
    } catch (err) {
      console.error("Refresh error:", err);
      return res.status(500).json({ success: false, message: "Could not refresh token" });
    }
  },

  logout: async (_req, res) => {
    return res.json({ success: true, message: "Logged out successfully" });
  },

  me: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      return res.json({
        success: true,
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
      });
    } catch (err) {
      console.error("Me error:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch user" });
    }
  },
};

module.exports = AuthController;
