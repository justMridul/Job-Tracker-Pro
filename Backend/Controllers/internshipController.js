// Controllers/internshipController.js
"use strict";

const Internship = require("../models/Internship");

// Lightweight 404 helper to standardize response via error middleware
class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.statusCode = 404;
  }
}

/**
 * Create an internship posting.
 * Associates postedBy with the authenticated user if available.
 */
exports.createInternship = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.user && req.user._id && !payload.postedBy) {
      payload.postedBy = req.user._id;
    }

    const internship = await Internship.create(payload);
    const doc = await Internship.findById(internship._id)
      .populate("postedBy", "name email")
      .lean();

    return res.status(201).json(doc);
  } catch (error) {
    return next(error);
  }
};

/**
 * List internships with pagination, sorting, search, and filters.
 * Query: page, limit, sort, q, status, stipendMin, stipendMax, duration
 */
exports.getAllInternships = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit ?? "10", 10), 1), 100);
    const sortInput = String(req.query.sort || "-createdAt");
    const dir = sortInput.startsWith("-") ? -1 : 1;
    const sortField = sortInput.replace(/^-/, "") || "createdAt";
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.duration) filter.duration = req.query.duration;

    // stipend range
    if (req.query.stipendMin || req.query.stipendMax) {
      filter.stipend = {};
      if (req.query.stipendMin) filter.stipend.$gte = Number(req.query.stipendMin);
      if (req.query.stipendMax) filter.stipend.$lte = Number(req.query.stipendMax);
    }

    if (req.query.q) {
      const rx = new RegExp(req.query.q, "i");
      filter.$or = [{ title: rx }, { company: rx }, { location: rx }, { description: rx }];
    }

    // If internships should be scoped to creator, uncomment:
    // if (req.user && req.user._id) filter.postedBy = req.user._id;

    const [items, total] = await Promise.all([
      Internship.find(filter)
        .populate("postedBy", "name email")
        .sort({ [sortField]: dir })
        .skip(skip)
        .limit(limit)
        .lean(),
      Internship.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      meta: { total, page, limit, pages: Math.ceil(total / limit), sort: (dir < 0 ? "-" : "") + sortField },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get a single internship by id.
 */
exports.getInternshipById = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate("postedBy", "name email")
      .lean();

    if (!internship) throw new NotFoundError("Internship not found");

    return res.status(200).json(internship);
  } catch (error) {
    return next(error);
  }
};

/**
 * Update an internship by id.
 */
exports.updateInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("postedBy", "name email")
      .lean();

    if (!internship) throw new NotFoundError("Internship not found");

    return res.status(200).json(internship);
  } catch (error) {
    return next(error);
  }
};

