"use strict";

const { body, validationResult } = require("express-validator");

exports.validateApplicationCreate = [
  body("candidate")
    .exists()
    .withMessage("candidate is required")
    .bail()
    .isString()
    .withMessage("candidate must be a string"),
  body("job")
    .optional()
    .isString()
    .withMessage("job must be a string"),
  body("internship")
    .optional()
    .isString()
    .withMessage("internship must be a string"),
  body("coverLetter")
    .optional()
    .isString()
    .withMessage("coverLetter must be a string"),
  body("resumeUrl")
    .optional()
    .isString()
    .withMessage("resumeUrl must be a string"),

  // New validations for deadlineDate and interviewDate
  body("deadlineDate")
    .optional()
    .isISO8601()
    .withMessage("deadlineDate must be a valid ISO 8601 date"),
  body("interviewDate")
    .optional()
    .isISO8601()
    .withMessage("interviewDate must be a valid ISO 8601 date"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }
    next();
  },
];

exports.validateApplicationStatusUpdate = [
  body("status")
    .exists()
    .withMessage("status is required")
    .bail()
    .isIn(["applied", "in-review", "interview", "accepted", "rejected"])
    .withMessage("status invalid"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }
    next();
  },
];

// New validation middleware for general update (including deadlineDate, interviewDate)
exports.validateApplicationUpdate = [
  body("company")
    .optional()
    .isString()
    .withMessage("company must be a string"),
  body("roleTitle")
    .optional()
    .isString()
    .withMessage("roleTitle must be a string"),
  body("status")
    .optional()
    .isIn(["applied", "in-review", "interview", "accepted", "rejected"])
    .withMessage("status invalid"),
  body("deadlineDate")
    .optional()
    .isISO8601()
    .withMessage("deadlineDate must be a valid ISO 8601 date"),
  body("interviewDate")
    .optional()
    .isISO8601()
    .withMessage("interviewDate must be a valid ISO 8601 date"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }
    next();
  },
];
