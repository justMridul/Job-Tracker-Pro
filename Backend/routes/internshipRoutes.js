// routes/internshipRoutes.js
"use strict";

const express = require("express");
const router = express.Router();

const internshipController = require("../Controllers/internshipController");
const { protect } = require("../MiddleWares/authMiddleware");
const { validateInternshipCreate, validateInternshipUpdate } = require("../MiddleWares/validateInternship");
const { validateRequest } = require("../MiddleWares/validateRequest");
const { validateInternshipListQuery } = require("../MiddleWares/validateQuery");

/**
 * @swagger
 * tags:
 *   name: Internships
 *   description: Internship postings management
 */

// Create internship
router.post("/", protect, validateInternshipCreate, validateRequest, internshipController.createInternship);

// List internships with filters/pagination
router.get("/", protect, validateInternshipListQuery, validateRequest, internshipController.getAllInternships);

// Get internship by id
router.get("/:id", protect, internshipController.getInternshipById);

// Update internship
router.put("/:id", protect, validateInternshipUpdate, validateRequest, internshipController.updateInternship);

module.exports = router;
