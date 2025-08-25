const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    trim: true,
    unique: true
  },
  darkMode: {
    type: Boolean,
    default: false,
    required: true
  },
  emailNotifications: {
    type: Boolean,
    default: true,
    required: true
  },
  notificationsFrequency: {
    type: String,
    enum: ['immediately', 'daily', 'weekly', 'never'],
    default: 'daily'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // adds createdAt and updatedAt timestamps automatically
  versionKey: false // disables the __v version field
});

// Index for faster lookup by username
settingsSchema.index({ username: 1 });

module.exports = mongoose.model('Settings', settingsSchema);
