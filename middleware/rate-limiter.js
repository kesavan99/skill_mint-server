const rateLimit = require("express-rate-limit");

const normalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    status: "error",
    code: "TOO_MANY_REQUESTS",
    message: "Too many requests. Try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  message: {
    status: "error",
    code: "TOO_MANY_REQUESTS_STRICT",
    message: "API usage too frequent. Please slow down."
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { normalLimiter, strictLimiter };