"use strict";

const Application = require("../models/Application");

exports.createApplication = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = {
      ...req.body,
      ownerId: req.user.id,
    };

    const allowedFields = [
      "company",
      "roleTitle",
      "status",
      "deadlineDate",
      "interviewDate",
      "resumeVersion",
      "links",
      "notes",
    ];

    const filteredPayload = {};
    allowedFields.forEach((field) => {
      if (payload[field] !== undefined) {
        filteredPayload[field] = payload[field];
      }
    });
    filteredPayload.ownerId = payload.ownerId;

    const doc = await Application.create(filteredPayload);
    return res.status(201).json(doc);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        error: "Duplicate application for this company and role by the user",
      });
    }
    return res.status(500).json({ error: "Failed to create application" });
  }
};

exports.getApplicationsByUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userId } = req.params;
    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(req.user.id) !== String(userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const sortDir = (req.query.sortDir || "desc").toLowerCase() === "asc" ? 1 : -1;
    const sort = { [sortBy]: sortDir };
    const filter = { ownerId: userId };

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.company) {
      filter.company = { $regex: req.query.company, $options: "i" };
    }

    const [items, total] = await Promise.all([
      Application.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Application.countDocuments(filter),
    ]);

    return res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch applications" });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const updateFields = req.body;

    const app = await Application.findById(id);
    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }

    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(app.ownerId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const allowedFields = [
      "company",
      "roleTitle",
      "status",
      "deadlineDate",
      "interviewDate",
      "resumeVersion",
      "links",
      "notes",
    ];

    allowedFields.forEach((field) => {
      if (updateFields[field] !== undefined) {
        app[field] = updateFields[field];
      }
    });

    await app.save();
    return res.json(app);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        error: "Duplicate application for this company and role by the user",
      });
    }
    return res.status(500).json({ error: "Failed to update application" });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { status } = req.body;

    const app = await Application.findById(id);
    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }

    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(app.ownerId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    app.status = status;
    await app.save();
    return res.json(app);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update status" });
  }
};
