// MiddleWares/validateSettings.js
const { body } = require('express-validator');

exports.validateSettings = [
  body('darkMode').optional().isBoolean().withMessage('darkMode must be boolean'),
  body('emailNotifications').optional().isBoolean().withMessage('emailNotifications must be boolean'),
  body('notificationsFrequency')
    .optional()
    .isIn(['immediately', 'daily', 'weekly', 'never'])
    .withMessage('notificationsFrequency invalid'),
];
