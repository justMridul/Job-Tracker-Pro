// Utils/errors.js

class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const badRequest = (message = 'Validation error', details) =>
  new AppError(message, 400, details);

const unauthorized = (message = 'Unauthorized') =>
  new AppError(message, 401);

const forbidden = (message = 'Forbidden') =>
  new AppError(message, 403);

const notFound = (message = 'Resource not found') =>
  new AppError(message, 404);

const conflict = (message = 'Conflict') =>
  new AppError(message, 409);

const serverError = (message = 'Internal server error', details) =>
  new AppError(message, 500, details);

module.exports = {
  AppError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
};
