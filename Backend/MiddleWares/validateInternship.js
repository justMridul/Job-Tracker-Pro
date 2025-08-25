// MiddleWares/validateInternship.js
const { body } = require('express-validator');

const common = [
  body('title').optional().isString().withMessage('title must be a string'),
  body('company').optional().isString().withMessage('company must be a string'),
  body('location').optional().isString().withMessage('location must be a string'),
  body('description').optional().isString().withMessage('description must be a string'),
  body('eligibility').optional().isArray().withMessage('eligibility must be an array'),
  body('eligibility.*').optional().isString().withMessage('each eligibility item must be a string'),
  body('duration').optional().isString().withMessage('duration must be a string'),
  body('stipend').optional().isNumeric().withMessage('stipend must be a number'),
  body('postedBy').optional().isString().withMessage('postedBy must be a string'),
  body('status').optional().isIn(['open', 'closed']).withMessage('status invalid')
];

exports.validateInternshipCreate = [
  body('title').exists().withMessage('title is required').bail().isString().withMessage('title must be a string'),
  body('company').exists().withMessage('company is required').bail().isString().withMessage('company must be a string'),
  ...common
];

exports.validateInternshipUpdate = [
  ...common
];
