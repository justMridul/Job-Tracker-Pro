"use strict";

// Wrap async controllers to forward errors to the global error handler
module.exports = (fn) => (req, res, next) =>
Promise.resolve(fn(req, res, next)).catch(next);