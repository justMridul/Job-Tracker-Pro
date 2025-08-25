"use strict";

const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    company: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 120,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 120,
      default: 'Not specified',
    },
    description: {
      type: String,
      maxlength: 10000,
      default: '',
    },
    requirements: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr),
        message: "requirements must be an array of strings",
      },
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    salaryRange: {
      min: {
        type: Number,
        min: 0,
      },
      max: {
        type: Number,
        min: 0,
        validate: {
          validator: function (v) {
            return (
              this.salaryRange?.min == null ||
              v == null ||
              v >= this.salaryRange.min
            );
          },
          message: "salaryRange.max must be greater than or equal to salaryRange.min",
        },
      },
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "internship", "remote"],
      default: "full-time",
      index: true,
    },
    // Updated status field for dashboard compatibility
    status: {
      type: String,
      enum: ["applied", "interview", "offer", "accepted", "rejected", "open", "closed"],
      default: "applied", // Changed from "open" for job application tracking
      index: true,
    },
    // NEW FIELDS for dashboard functionality
    dateAdded: {
      type: Date,
      default: Date.now,
      index: true,
    },
    deadlineDate: {
      type: Date,
      default: null,
    },
    interviewDate: {
      type: Date,
      default: null,
    },
    resumeVersion: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    links: [
      {
        label: {
          type: String,
          trim: true,
          maxlength: 100,
        },
        url: {
          type: String,
          trim: true,
          validate: {
            validator: function(v) {
              if (!v) return true; // Allow empty
              return /^https?:\/\/.+/.test(v);
            },
            message: 'URL must be a valid HTTP/HTTPS URL'
          }
        }
      }
    ],
    notes: {
      type: String,
      maxlength: 2000,
      default: '',
    },
    // Extra fields for additional job data
    extraFields: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        // Normalize id and hide internal fields
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

/**
 * Compound indexes for common queries and sorts
 */
jobSchema.index({ postedBy: 1, createdAt: -1 }); // user feed / recent first
jobSchema.index({ postedBy: 1, company: 1 }); // user + company filter
jobSchema.index({ postedBy: 1, title: 1 }); // user + title filter
jobSchema.index({ postedBy: 1, status: 1 }); // user + status filter (dashboard)
jobSchema.index({ postedBy: 1, dateAdded: -1 }); // user + date added (dashboard)

/**
 * Unique compound index to prevent duplicate job postings
 * Made less strict to allow similar jobs with different statuses
 */
jobSchema.index(
  { postedBy: 1, company: 1, title: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      status: { $in: ["applied", "interview", "offer", "accepted", "rejected"] }
    }
  }
);

/**
 * Text index for search across multiple fields
 */
jobSchema.index(
  { title: "text", company: "text", description: "text", location: "text", notes: "text" },
  { 
    weights: { 
      title: 10, 
      company: 8, 
      location: 4, 
      description: 2, 
      notes: 1 
    }, 
    name: "job_search_index" 
  }
);

/**
 * Pre-save middleware
 */
jobSchema.pre('save', function(next) {
  // Ensure dateAdded is set
  if (!this.dateAdded) {
    this.dateAdded = new Date();
  }
  
  // Validate interview date vs deadline
  if (this.deadlineDate && this.interviewDate && this.interviewDate < this.deadlineDate) {
    const err = new Error('Interview date cannot be before deadline date');
    err.name = 'ValidationError';
    return next(err);
  }
  
  next();
});

/**
 * Instance methods
 */
jobSchema.methods.toClientJSON = function() {
  const obj = this.toJSON();
  // Ensure frontend compatibility
  obj.roleTitle = obj.title; // For compatibility with frontend
  return obj;
};

/**
 * Static methods
 */
jobSchema.statics.findByUser = function(userId, filters = {}) {
  return this.find({ postedBy: userId, ...filters })
    .sort({ dateAdded: -1 })
    .populate('postedBy', 'name email');
};

jobSchema.statics.findByStatus = function(userId, status) {
  return this.find({ 
    postedBy: userId, 
    status: { $regex: new RegExp(status, 'i') }
  }).sort({ dateAdded: -1 });
};

module.exports = mongoose.model("Job", jobSchema);
