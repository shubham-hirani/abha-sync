"use strict";

var express = require('express');

var cors = require('cors');

var _require = require('@abha-sync/shared'),
    logger = _require.logger,
    errorHandler = _require.errorHandler,
    rateLimiter = _require.rateLimiter,
    initializeDatabase = _require.initializeDatabase;

var uploadRouter = require('./routes/upload');

var recordsRouter = require('./routes/records');

var consentRouter = require('./routes/consent');

var authRouter = require('./routes/auth');

var healthRouter = require('./routes/health');

var remindersRouter = require('./routes/reminders');

var app = express();
var PORT = process.env.PORT || 3010; // Middleware

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({
  limit: '10mb'
}));
app.use(rateLimiter({
  windowMs: 60000,
  maxRequests: 100
})); // Request logging

app.use(function (req, _res, next) {
  logger.info("".concat(req.method, " ").concat(req.path), {
    query: req.query
  });
  next();
}); // Routes

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/records', recordsRouter);
app.use('/api/consent-upload', consentRouter);
app.use('/api/reminders', remindersRouter); // Error handling

app.use(errorHandler);

if (require.main === module) {
  // Initialize database on startup
  initializeDatabase();
  app.listen(PORT, function () {
    logger.info("API Gateway running on port ".concat(PORT));
    logger.info("Services: extraction=".concat(process.env.AI_EXTRACTION_URL || 'http://localhost:3001'));
    logger.info("Services: normalization=".concat(process.env.NORMALIZATION_URL || 'http://localhost:3002'));
    logger.info("Services: fhir=".concat(process.env.FHIR_GENERATOR_URL || 'http://localhost:3003'));
    logger.info("Services: abha=".concat(process.env.ABHA_MOCK_URL || 'http://localhost:3004'));
  });
}

module.exports = app;