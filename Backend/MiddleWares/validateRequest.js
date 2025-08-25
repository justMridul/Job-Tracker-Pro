// MiddleWares/validateRequest.js
"use strict";

const { validationResult } = require("express-validator");

/**
 * Enhanced middleware to handle express-validator validation results
 * Provides structured error responses for better frontend integration
 */
exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Get all validation errors
    const validationErrors = errors.array();
    
    // Group errors by field for better frontend handling
    const fieldErrors = {};
    const generalErrors = [];
    
    validationErrors.forEach(error => {
      const field = error.path || error.param;
      
      if (field) {
        // Field-specific errors
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push({
          message: error.msg,
          value: error.value,
          location: error.location || 'body'
        });
      } else {
        // General validation errors
        generalErrors.push({
          message: error.msg,
          value: error.value
        });
      }
    });
    
    // Create detailed error response
    const errorResponse = {
      success: false,
      error: "Validation failed",
      message: "One or more fields contain invalid data",
      details: {
        fieldErrors,
        ...(generalErrors.length > 0 && { generalErrors }),
        errorCount: validationErrors.length
      }
    };
    
    // Log validation errors for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Validation Error:', {
        endpoint: `${req.method} ${req.originalUrl}`,
        errors: validationErrors,
        body: req.body
      });
    }
    
    return res.status(400).json(errorResponse);
  }
  
  // Validation passed, continue to next middleware
  next();
};

/**
 * Alternative middleware for simpler error format (backward compatibility)
 */
exports.validateRequestSimple = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error) => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value,
        location: error.location || 'body'
      }))
    });
  }
  
  next();
};

/**
 * Custom error formatter for specific use cases
 */
exports.formatValidationErrors = (errors) => {
  const formatted = {
    fieldErrors: {},
    summary: []
  };
  
  errors.array().forEach(error => {
    const field = error.path || error.param;
    
    // Add to field-specific errors
    if (field) {
      if (!formatted.fieldErrors[field]) {
        formatted.fieldErrors[field] = [];
      }
      formatted.fieldErrors[field].push(error.msg);
    }
    
    // Add to summary
    formatted.summary.push(`${field}: ${error.msg}`);
  });
  
  return formatted;
};

/**
 * Middleware factory for custom error handling
 */
exports.createValidationMiddleware = (options = {}) => {
  const {
    includeValue = false,
    includeLocation = false,
    customMessage = "Validation failed",
    statusCode = 400
  } = options;
  
  return (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => {
        const errorObj = {
          field: error.path || error.param,
          message: error.msg
        };
        
        if (includeValue) errorObj.value = error.value;
        if (includeLocation) errorObj.location = error.location;
        
        return errorObj;
      });
      
      return res.status(statusCode).json({
        success: false,
        error: customMessage,
        details: formattedErrors,
        timestamp: new Date().toISOString()
      });
    }
    
    next();
  };
};

/**
 * Express error handler for validation errors
 * Use this as a fallback error handler in your app
 */
exports.handleValidationError = (err, req, res, next) => {
  // Handle express-validator specific errors
  if (err.type === 'validation') {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: err.message,
      details: err.errors || []
    });
  }
  
  // Pass other errors to next handler
  next(err);
};

/**
 * Utility function to check if request has validation errors
 * Useful for conditional logic in controllers
 */
exports.hasValidationErrors = (req) => {
  const errors = validationResult(req);
  return !errors.isEmpty();
};

/**
 * Get validation errors without throwing
 * Useful when you want to handle errors manually in controllers
 */
exports.getValidationErrors = (req) => {
  const errors = validationResult(req);
  return errors.isEmpty() ? null : errors.array();
};
