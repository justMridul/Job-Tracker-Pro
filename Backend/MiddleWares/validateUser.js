"use strict";

const { body, validationResult } = require("express-validator");

// Common email validation
const emailValidation = body("email")
  .trim()
  .isEmail()
  .withMessage("A valid email address is required")
  .isLength({ max: 254 })
  .withMessage("Email must not exceed 254 characters")
  .normalizeEmail();

// Common password validation
const passwordValidation = body("password")
  .isLength({ min: 8, max: 128 })
  .withMessage("Password must be between 8 and 128 characters long");

const validateRegister = [
  body("name")
    .optional() // Name is optional, but validate if provided
    .isString()
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters")
    .trim()
    .escape(),
  emailValidation,
  passwordValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map((e) => e.msg),
      });
    }
    next();
  },
];

const validateLogin = [
  emailValidation,
  passwordValidation.withMessage("Password is required"), // enforce rule for login too
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map((e) => e.msg),
      });
    }
    next();
  },
];

module.exports = {
  validateRegister,
  validateLogin,
};
