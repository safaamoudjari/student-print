import rateLimit from 'express-rate-limit';

// Generous limit for normal API usage.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down and try again shortly.' },
});

// Strict limit on auth endpoints to slow down brute-force login/registration
// attempts, on top of the per-account lockout in the User model.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});
