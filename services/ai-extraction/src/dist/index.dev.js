"use strict";

var express = require('express');

var cors = require('cors');

var _require = require('@abha-sync/shared'),
    logger = _require.logger,
    errorHandler = _require.errorHandler,
    rateLimiter = _require.rateLimiter;

var extractionRouter = require('./routes/extraction');

var app = express();
var PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json({
  limit: '10mb'
}));
app.use(rateLimiter({
  windowMs: 60000,
  maxRequests: 60
})); // Health check

app.get('/health', function (_req, res) {
  res.json({
    status: 'healthy',
    service: 'ai-extraction',
    timestamp: new Date().toISOString()
  });
}); // Routes

app.use('/extract', extractionRouter); // Error handling

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, function () {
    logger.info("AI Extraction Service running on port ".concat(PORT));
  });
}

module.exports = app;