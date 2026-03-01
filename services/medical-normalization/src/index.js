const express = require('express');
const cors = require('cors');
const { logger, errorHandler, rateLimiter } = require('@abha-sync/shared');
const normalizationRouter = require('./routes/normalization');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(rateLimiter({ windowMs: 60000, maxRequests: 60 }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'medical-normalization', timestamp: new Date().toISOString() });
});

// Routes
app.use('/normalize', normalizationRouter);

// Error handling
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Medical Normalization Service running on port ${PORT}`);
  });
}

module.exports = app;
