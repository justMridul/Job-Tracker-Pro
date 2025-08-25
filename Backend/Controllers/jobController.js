"use strict";

const Job = require("../models/Job");
const mongoose = require("mongoose");

// Custom error classes
class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message = "Validation failed") {
    super(message);
    this.statusCode = 400;
  }
}

/**
 * Create a job application
 */
exports.createJob = async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    // Prepare job data
    const jobData = {
      ...req.body,
      postedBy: req.user._id,
      dateAdded: new Date(),
    };

    // Set default status for job applications
    if (!jobData.status) {
      jobData.status = 'applied';
    }

    // Validate required fields
    if (!jobData.title || !jobData.company) {
      throw new ValidationError("Title and company are required");
    }

    const job = await Job.create(jobData);

    // Return populated job
    const populatedJob = await Job.findById(job._id)
      .populate("postedBy", "name email")
      .lean();

    return res.status(201).json({
      success: true,
      data: populatedJob,
      message: "Job application created successfully"
    });

  } catch (error) {
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "Duplicate job application for this company and position",
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: Object.values(error.errors).map(e => e.message)
      });
    }

    return next(error);
  }
};

/**
 * Get all jobs for the authenticated user
 */
exports.getAllJobs = async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "100", 10), 1), 1000);
    const sortInput = String(req.query.sort || "-dateAdded");
    const dir = sortInput.startsWith("-") ? -1 : 1;
    const sortField = sortInput.replace(/^-/, "") || "dateAdded";
    const skip = (page - 1) * limit;

    // Build filter for user's jobs only
    const filter = { postedBy: req.user._id };

    // Add additional filters
    if (req.query.status) {
      filter.status = { $regex: new RegExp(req.query.status, 'i') };
    }
    if (req.query.company) {
      filter.company = { $regex: new RegExp(req.query.company, 'i') };
    }
    if (req.query.q) {
      const searchRegex = new RegExp(req.query.q, "i");
      filter.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { location: searchRegex },
        { description: searchRegex },
        { notes: searchRegex },
      ];
    }

    // Execute queries in parallel
    const [items, total] = await Promise.all([
      Job.find(filter)
        .populate("postedBy", "name email")
        .sort({ [sortField]: dir })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter),
    ]);

    // Transform for frontend compatibility
    const transformedItems = items.map(item => ({
      ...item,
      roleTitle: item.title, // For compatibility
    }));

    return res.status(200).json({
      success: true,
      data: transformedItems,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        sort: (dir < 0 ? "-" : "") + sortField,
        userJobsOnly: true,
      },
    });

  } catch (error) {
    return next(error);
  }
};

/**
 * Get a single job by ID (user must own it)
 */
exports.getJobById = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid job ID format");
    }

    const job = await Job.findOne({ 
      _id: id, 
      postedBy: req.user._id 
    })
      .populate("postedBy", "name email")
      .lean();

    if (!job) {
      throw new NotFoundError("Job not found or access denied");
    }

    // Add compatibility field
    job.roleTitle = job.title;

    return res.status(200).json({
      success: true,
      data: job
    });

  } catch (error) {
    return next(error);
  }
};

/**
 * Update a job by ID (user must own it)
 */
exports.updateJob = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid job ID format");
    }

    // Define allowed fields for updates
    const allowedFields = [
      "title",
      "company", 
      "location",
      "description",
      "requirements",
      "salaryRange",
      "jobType",
      "status",
      "deadlineDate",
      "interviewDate",
      "resumeVersion",
      "links",
      "notes",
      "extraFields",
    ];

    // Filter update data to only allowed fields
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Don't allow updating postedBy or dateAdded
    delete updateData.postedBy;
    delete updateData.dateAdded;

    const options = {
      new: true,
      runValidators: true,
    };

    const job = await Job.findOneAndUpdate(
      { _id: id, postedBy: req.user._id }, 
      updateData, 
      options
    )
      .populate("postedBy", "name email")
      .lean();

    if (!job) {
      throw new NotFoundError("Job not found or access denied");
    }

    // Add compatibility field
    job.roleTitle = job.title;

    return res.status(200).json({
      success: true,
      data: job,
      message: "Job updated successfully"
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "Duplicate job application for this company and position",
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: Object.values(error.errors).map(e => e.message)
      });
    }

    return next(error);
  }
};

/**
 * Delete a job by ID (user must own it) - ADDED THIS MISSING FUNCTION
 */
exports.deleteJob = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid job ID format");
    }

    const job = await Job.findOneAndDelete({ 
      _id: id, 
      postedBy: req.user._id 
    });

    if (!job) {
      throw new NotFoundError("Job not found or access denied");
    }

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
      data: { deletedId: id }
    });

  } catch (error) {
    return next(error);
  }
};

/**
 * Get job statistics for the authenticated user - NEW FUNCTION FOR DASHBOARD
 */
exports.getJobStats = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const stats = await Job.aggregate([
      { $match: { postedBy: mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Transform to expected format
    const statusCounts = {};
    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    const result = {
      total: stats.reduce((sum, stat) => sum + stat.count, 0),
      applied: statusCounts.applied || 0,
      interview: statusCounts.interview || 0,
      pending: statusCounts.pending || 0,
      offer: statusCounts.offer || 0,
      accepted: statusCounts.accepted || 0,
      rejected: statusCounts.rejected || 0,
    };

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    return next(error);
  }
};

/**
 * Bulk delete jobs - NEW FUNCTION FOR DASHBOARD
 */
exports.deleteAllJobs = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const result = await Job.deleteMany({ postedBy: req.user._id });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} jobs deleted successfully`,
      data: { deletedCount: result.deletedCount }
    });

  } catch (error) {
    return next(error);
  }
};
