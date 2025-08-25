const { body } = require("express-validator");

const common = [
  body("title")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("title must be a string between 1-120 characters"),
    
  body("company")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("company must be a string between 1-120 characters"),
    
  body("location")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 120 })
    .withMessage("location must be a string up to 120 characters"),
    
  body("description")
    .optional()
    .isString()
    .isLength({ max: 10000 })
    .withMessage("description must be a string up to 10000 characters"),
    
  body("requirements")
    .optional()
    .isArray()
    .withMessage("requirements must be an array"),
    
  body("requirements.*")
    .optional()
    .isString()
    .withMessage("each requirement must be a string"),
    
  body("salaryRange")
    .optional()
    .isObject()
    .withMessage("salaryRange must be an object"),
    
  body("salaryRange.min")
    .optional()
    .isNumeric()
    .withMessage("salaryRange.min must be a number"),
    
  body("salaryRange.max")
    .optional()
    .isNumeric()
    .withMessage("salaryRange.max must be a number"),
    
  body("jobType")
    .optional()
    .isIn(["full-time", "part-time", "internship", "remote"])
    .withMessage("jobType must be one of: full-time, part-time, internship, remote"),
    
  body("status")
    .optional()
    .isIn(["applied", "interview", "offer", "accepted", "rejected", "open", "closed"])
    .withMessage("status must be one of: applied, interview, offer, accepted, rejected, open, closed"),
    
  body("postedBy")
    .optional()
    .isMongoId()
    .withMessage("postedBy must be a valid MongoDB ObjectId"),
    
  // NEW VALIDATIONS for dashboard fields
  body("dateAdded")
    .optional()
    .isISO8601()
    .withMessage("dateAdded must be a valid ISO date"),
    
  body("deadlineDate")
    .optional()
    .isISO8601()
    .withMessage("deadlineDate must be a valid ISO date"),
    
  body("interviewDate")
    .optional()
    .isISO8601()
    .withMessage("interviewDate must be a valid ISO date"),
    
  body("resumeVersion")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("resumeVersion must be a string up to 100 characters"),
    
  body("links")
    .optional()
    .isArray()
    .withMessage("links must be an array"),
    
  body("links.*.label")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("each link label must be a string up to 100 characters"),
    
  body("links.*.url")
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage("each link url must be a valid HTTP/HTTPS URL"),
    
  body("notes")
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage("notes must be a string up to 2000 characters"),
    
  body("extraFields")
    .optional()
    .isObject()
    .withMessage("extraFields must be an object"),
];

// Custom validation for date logic
const validateDates = body().custom((value, { req }) => {
  const { deadlineDate, interviewDate } = req.body;
  
  if (deadlineDate && interviewDate) {
    const deadline = new Date(deadlineDate);
    const interview = new Date(interviewDate);
    
    if (interview < deadline) {
      throw new Error('Interview date cannot be before deadline date');
    }
  }
  
  return true;
});

exports.validateJobCreate = [
  body("title")
    .exists()
    .withMessage("title is required")
    .bail()
    .isString()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("title must be a string between 1-120 characters"),
    
  body("company")
    .exists()
    .withMessage("company is required")
    .bail()
    .isString()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("company must be a string between 1-120 characters"),
    
  ...common,
  validateDates,
];

exports.validateJobUpdate = [
  ...common,
  validateDates,
];

// Export individual field validators for reuse
exports.validateJobFields = {
  title: body("title").isString().trim().isLength({ min: 1, max: 120 }),
  company: body("company").isString().trim().isLength({ min: 1, max: 120 }),
  status: body("status").isIn(["applied", "interview", "offer", "accepted", "rejected", "open", "closed"]),
  location: body("location").optional().isString().trim(),
  notes: body("notes").optional().isString().isLength({ max: 2000 }),
};
