const { AppError } = require('./errorHandler');

/**
 * Simple in-memory rate limiter middleware
 */
function rateLimiter({ windowMs = 60000, maxRequests = 100 } = {}) {
  const requests = new Map();

  // Cleanup old entries every minute
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requests.entries()) {
      if (now - data.windowStart > windowMs) {
        requests.delete(key);
      }
    }
  }, windowMs);

  return (req, _res, next) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const record = requests.get(key);

    if (!record || now - record.windowStart > windowMs) {
      requests.set(key, { windowStart: now, count: 1 });
      return next();
    }

    record.count++;
    if (record.count > maxRequests) {
      return next(new AppError('Too many requests, please try again later', 429));
    }

    next();
  };
}

module.exports = { rateLimiter };
