// Controllers/settingsController.js
const User = require('../models/User');
const { NotFoundError, BadRequestError } = require('../Utils/errors');

// Helper: project only settings-related fields
const SETTINGS_PROJECTION = {
  'profile.darkMode': 1,
  'profile.emailNotifications': 1,
  'profile.notificationsFrequency': 1,
  _id: 0,
};

// GET /settings/:username
// Note: adjust the lookup field depending on your schema:
// - If you have user.username, use { username }
// - If your route is using username but you actually store email, decide whether to map it or change the route.
exports.getSettingsByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    // Change this to { username } if you store usernames
    const user = await User.findOne({ email: username }, SETTINGS_PROJECTION).lean();

    if (!user) throw new NotFoundError('Settings not found');

    const settings = {
      darkMode: user.profile?.darkMode ?? false,
      emailNotifications: user.profile?.emailNotifications ?? true,
      notificationsFrequency: user.profile?.notificationsFrequency ?? 'daily',
    };

    res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
};

// PUT /settings/:username
exports.updateSettings = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { darkMode, emailNotifications, notificationsFrequency } = req.body;

    if (
      notificationsFrequency &&
      !['immediately', 'daily', 'weekly', 'never'].includes(notificationsFrequency)
    ) {
      throw new BadRequestError('Invalid notificationsFrequency');
    }

    // Build $set only for provided fields to avoid overwriting with undefined
    const set = {};
    if (typeof darkMode === 'boolean') set['profile.darkMode'] = darkMode;
    if (typeof emailNotifications === 'boolean') set['profile.emailNotifications'] = emailNotifications;
    if (typeof notificationsFrequency === 'string') set['profile.notificationsFrequency'] = notificationsFrequency;

    // Change this to { username } if you store usernames
    const updated = await User.findOneAndUpdate(
      { email: username },
      { $set: set },
      { new: true, runValidators: true, projection: SETTINGS_PROJECTION }
    ).lean();

    if (!updated) throw new NotFoundError('Settings not found');

    const settings = {
      darkMode: updated.profile?.darkMode ?? false,
      emailNotifications: updated.profile?.emailNotifications ?? true,
      notificationsFrequency: updated.profile?.notificationsFrequency ?? 'daily',
    };

    res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
};
