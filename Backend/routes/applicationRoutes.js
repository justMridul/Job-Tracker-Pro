"use strict";

const express = require("express");
const router = express.Router();

const applicationController = require("../Controllers/applicationController");
const { protect } = require("../MiddleWares/authMiddleware");
const {
  validateApplicationCreate,
  validateApplicationStatusUpdate,
  validateApplicationUpdate,
} = require("../MiddleWares/validateApplication");
const { validateRequest } = require("../MiddleWares/validateRequest");
const { validateApplicationsByUserQuery } = require("../MiddleWares/validateQuery");

// Create a new application (owner set from req.user.id in controller)
router.post(
  "/",
  protect,
  validateApplicationCreate,
  validateRequest,
  applicationController.createApplication
);

// Get applications by user (owner-or-admin enforced in controller) with pagination/sorting/filters
router.get(
  "/user/:userId",
  protect,
  validateApplicationsByUserQuery,
  validateRequest,
  applicationController.getApplicationsByUser
);

// Update application status (owner-or-admin enforced in controller)
router.put(
  "/:id/status",
  protect,
  validateApplicationStatusUpdate,
  validateRequest,
  applicationController.updateApplicationStatus
);

// General update for the full application including deadlines, interview dates, and other fields
router.put(
  "/:id",
  protect,
  validateApplicationUpdate,
  validateRequest,
  applicationController.updateApplication
);

module.exports = router;
