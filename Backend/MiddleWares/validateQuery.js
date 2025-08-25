"use strict";

const { param, query, validationResult } = require("express-validator");

// Existing validators (unchanged)
exports.validateJobListQuery = [
  query("page").optional().isInt({ min: 1 }).toInt().withMessage("page must be >=1"),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt().withMessage("limit must be 1-100"),
  query("sort").optional().isString(),
  query("q").optional().isString(),
  query("status").optional().isIn(["open", "closed"]).withMessage("status invalid"),
  query("jobType")
    .optional()
    .isIn(["full-time", "part-time", "internship", "remote"])
    .withMessage("jobType invalid"),
];

exports.validateInternshipListQuery = [
  query("page").optional().isInt({ min: 1 }).toInt().withMessage("page must be >=1"),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt().withMessage("limit must be 1-100"),
  query("sort").optional().isString(),
  query("q").optional().isString(),
  query("status").optional().isIn(["open", "closed"]).withMessage("status invalid"),
  query("company").optional().isString(),
];

// Applications-by-user list query validator (enhanced)
const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt", "company", "roleTitle", "status"];
const ALLOWED_SORT_DIR = ["asc", "desc"];
const ALLOWED_APP_STATUSES = ["applied", "in-review", "interview", "accepted", "rejected"];

exports.validateApplicationsByUserQuery = [
  // Path param userId (ensure present and plausibly valid string/ObjectId-like length)
  param("userId")
    .isString()
    .isLength({ min: 10 })
    .withMessage("userId is required and must be at least 10 characters"),

  // Pagination
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),

  // Sorting
  query("sortBy")
    .optional()
    .isIn(ALLOWED_SORT_FIELDS)
    .withMessage(`sortBy must be one of: ${ALLOWED_SORT_FIELDS.join(", ")}`),
  query("sortDir")
    .optional()
    .isIn(ALLOWED_SORT_DIR)
    .withMessage(`sortDir must be one of: ${ALLOWED_SORT_DIR.join(", ")}`),

  // Filters
  query("status")
    .optional()
    .isIn(ALLOWED_APP_STATUSES)
    .withMessage(`status must be one of: ${ALLOWED_APP_STATUSES.join(", ")}`),
  query("company")
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .trim(),

  // Validation result handling middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }
    next();
  }
];
