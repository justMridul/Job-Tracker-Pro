"use strict";

const express = require("express");
const { query } = require("express-validator");
const jobController = require("../Controllers/jobController");
const { protect } = require("../MiddleWares/authMiddleware");
const { validateRequest } = require("../MiddleWares/validateRequest");
const { validateJobCreate, validateJobUpdate } = require("../MiddleWares/validateJob");

const router = express.Router();

/**
 * Query validator for job listing
 */
const validateJobListQuery = [
  query("page").optional().isInt({ min: 1 }).toInt().withMessage("page must be >=1"),
  query("limit").optional().isInt({ min: 1, max: 1000 }).toInt().withMessage("limit must be 1-1000"),
  query("sort").optional().isString(),
  query("q").optional().isString(),
  query("status").optional().isIn(["applied", "interview", "offer", "accepted", "rejected", "open", "closed"]).withMessage("status invalid"),
  query("company").optional().isString(),
  query("jobType")
    .optional()
    .isIn(["full-time", "part-time", "internship", "remote"])
    .withMessage("jobType invalid"),
];

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/jobs
 * @desc    Create a new job application
 * @access  Private
 */
router.post("/", validateJobCreate, validateRequest, jobController.createJob);

/**
 * @route   GET /api/jobs
 * @desc    Get all job applications for authenticated user
 * @access  Private
 */
router.get("/", validateJobListQuery, validateRequest, jobController.getAllJobs);

/**
 * @route   GET /api/jobs/stats
 * @desc    Get job statistics for dashboard
 * @access  Private
 */
router.get("/stats", jobController.getJobStats);

/**
 * @route   GET /api/jobs/:id
 * @desc    Get a specific job application by ID
 * @access  Private
 */
router.get("/:id", jobController.getJobById);

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update a job application by ID
 * @access  Private
 */
router.put("/:id", validateJobUpdate, validateRequest, jobController.updateJob);

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete a job application by ID
 * @access  Private
 */
router.delete("/:id", jobController.deleteJob);

/**
 * @route   DELETE /api/jobs
 * @desc    Delete all job applications for authenticated user
 * @access  Private
 */
router.delete("/", jobController.deleteAllJobs);

module.exports = router;
