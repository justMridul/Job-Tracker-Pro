"use strict";

const mongoose = require("mongoose");
const User = require("../models/User");
const { BadRequestError, NotFoundError } = require("../Utils/errors");

// Utility to safely normalize email if present
function normalizeEmail(email) {
  return typeof email === "string" ? email.toLowerCase() : email;
}

// GET /users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, "-password").lean();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// GET /users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestError("Invalid user id");
    }

    const user = await User.findById(id, "-password").lean();
    if (!user) throw new NotFoundError("User not found");

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /users/:id
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestError("Invalid user id");
    }

    const updates = { ...req.body };

    // Prevent changing sensitive/immutable fields directly
    delete updates.password; // password changes should go through a dedicated endpoint with hashing
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    // Normalize email if present and check uniqueness
    if (updates.email) {
      updates.email = normalizeEmail(updates.email);

      const existing = await User.findOne({
        email: updates.email,
        _id: { $ne: id },
      }).lean();

      if (existing) {
        throw new BadRequestError("Email already in use");
      }
    }

    // Use findByIdAndUpdate with options
    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      // In Mongoose v7+, 'select' isn't an option here; use projection instead:
      projection: "-password",
    }).lean();

    if (!user) throw new NotFoundError("User not found");

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
