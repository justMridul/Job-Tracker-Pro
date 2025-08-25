// models/Internship.js
"use strict";

const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    company: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    location: { type: String, trim: true, maxlength: 120 },
    description: { type: String, maxlength: 10_000 },
    eligibility: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr),
        message: "eligibility must be an array of strings",
      },
    },
    duration: { type: String, trim: true, maxlength: 120 },
    stipend: { type: Number, min: 0, index: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["open", "closed"], default: "open", index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes for common queries
internshipSchema.index({ postedBy: 1, createdAt: -1 });
internshipSchema.index({ company: 1 });
internshipSchema.index({ title: 1 });

// Basic text index for search
internshipSchema.index(
  { title: "text", company: "text", description: "text", location: "text" },
  { weights: { title: 6, company: 5, description: 2, location: 2 }, name: "internship_text_index" }
);

module.exports = mongoose.model("Internship", internshipSchema);
