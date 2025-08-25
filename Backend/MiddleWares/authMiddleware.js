"use strict";

const jwt = require("jsonwebtoken");
const User = require("../Models/User");

class UnauthorizedError extends Error {
  constructor(message = "Not authorized") {
    super(message);
    this.statusCode = 401;
  }
}

class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.statusCode = 403;
  }
}

/**
 * Get JWT secret with fallbacks - FIXED INCONSISTENCY
 */
const getJWTSecret = () => {
  return process.env.JWT_ACCESS_SECRET || 
         process.env.ACCESS_TOKEN_SECRET || 
         process.env.JWT_SECRET;
};

/**
 * Require a valid JWT and attach the user to req.user
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1. Try Authorization header first (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. If not found, try cookies
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // 3. Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided."
      });
    }

    // 4. Verify token with correct secret
    let decoded;
    try {
      const secret = getJWTSecret();
      if (!secret) {
        throw new Error("JWT secret not configured");
      }
      decoded = jwt.verify(token, secret);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError.message);
      return res.status(401).json({
        success: false,
        error: "Invalid token"
      });
    }

    // 5. Extract user ID from token payload
    const userId = decoded.sub || decoded.id || decoded._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Invalid token payload"
      });
    }

    // 6. Get user from database
    const user = await User.findById(userId).select("-passwordHash -refreshJti");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found"
      });
    }

    // 7. Attach user to request object
    req.user = {
      _id: user._id,
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return next();

  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      error: "Authentication failed"
    });
  }
};

/**
 * Role-based authorization middleware
 */
exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required"
    });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: "Insufficient permissions"
    });
  }

  return next();
};

/**
 * Optional auth middleware - doesn't fail if no token
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const secret = getJWTSecret();
        if (secret) {
          const decoded = jwt.verify(token, secret);
          const userId = decoded.sub || decoded.id || decoded._id;
          
          if (userId) {
            const user = await User.findById(userId).select("-passwordHash -refreshJti");
            if (user) {
              req.user = {
                _id: user._id,
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
              };
            }
          }
        }
      } catch (error) {
        // Ignore token errors in optional auth
      }
    }

    return next();
  } catch (error) {
    return next();
  }
};
