"use strict";
module.exports = (_req, res) => {
res.status(404).json({ success: false, error: { message: "Route not found" } });
};