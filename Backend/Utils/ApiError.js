"use strict";

class ApiError extends Error {
constructor(statusCode = 500, message = "Internal Server Error", details) {
super(message);
this.statusCode = statusCode;
this.details = details;
}
}

module.exports = ApiError;