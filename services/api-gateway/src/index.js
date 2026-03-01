const express = require('express');
const cors = require('cors');
const { logger, errorHandler, rateLimiter, initializeDatabase } = require('@abha-sync/shared');
const uploadRouter = require('./routes/upload');
const recordsRouter = require('./routes/records');
const consentRouter = require('./routes/consent');
const authRouter = require('./routes/auth');
const healthRouter = require('./routes/health');
const remindersRouter = require('./routes/reminders');

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter({ windowMs: 60000, maxRequests: 100 }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, { query: req.query });
  next();
});

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/records', recordsRouter);
app.use('/api/consent-upload', consentRouter);
app.use('/api/reminders', remindersRouter);

// Error handling
app.use(errorHandler);

if (require.main === module) {
  // Initialize database on startup
  initializeDatabase();

  app.listen(PORT, () => {
    logger.info(`API Gateway running on port ${PORT}`);
    logger.info(`Services: extraction=${process.env.AI_EXTRACTION_URL || 'http://localhost:3001'}`);
    logger.info(`Services: normalization=${process.env.NORMALIZATION_URL || 'http://localhost:3002'}`);
    logger.info(`Services: fhir=${process.env.FHIR_GENERATOR_URL || 'http://localhost:3003'}`);
    logger.info(`Services: abha=${process.env.ABHA_MOCK_URL || 'http://localhost:3004'}`);
  });
}

module.exports = app;
