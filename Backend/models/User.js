"use strict";

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    googleId: { type: String, unique: true, sparse: true },
    profilePicture: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Normalize email to lowercase before save
userSchema.pre("save", function (next) {
  if (this.isModified("email") && typeof this.email === "string") {
    this.email = this.email.toLowerCase();
  }
  next();
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
