"use strict";

var express = require('express');

var cors = require('cors');

var _require = require('@abha-sync/shared'),
    logger = _require.logger,
    errorHandler = _require.errorHandler,
    rateLimiter = _require.rateLimiter;

var fhirRouter = require('./routes/fhir');

var app = express();
var PORT = process.env.PORT || 3003;
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
    service: 'fhir-generator',
    timestamp: new Date().toISOString()
  });
}); // Routes

app.use('/generate', fhirRouter); // Error handling

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, function () {
    logger.info("FHIR Generator Service running on port ".concat(PORT));
  });
}

module.exports = app;