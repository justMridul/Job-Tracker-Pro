// Backend/models/Application.js
"use strict";

const mongoose = require("mongoose");

const LinkSchema = new mongoose.Schema({
  label: { type: String, default: "" },
  url: { type: String, default: "" },
}, { _id: false }); // _id false to prevent auto _id for subdocuments if not needed

const ApplicationSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: { type: String, required: true, trim: true },
    roleTitle: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["applied", "interview", "offer", "rejected", "accepted"],
      default: "applied",
    },
    // Deadlines and interview dates
    deadlineDate: { type: Date, required: false },
    interviewDate: { type: Date, required: false },

    // New fields
    resumeVersion: { type: String, trim: true, default: "" },
    links: {
      type: [LinkSchema],
      default: [],
    },
    notes: { type: String, trim: true, default: "" },

    // Add any other existing fields here...
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", ApplicationSchema);
