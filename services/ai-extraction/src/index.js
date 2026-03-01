const express = require('express');
const cors = require('cors');
const { logger, errorHandler, rateLimiter } = require('@abha-sync/shared');
const extractionRouter = require('./routes/extraction');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter({ windowMs: 60000, maxRequests: 60 }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'ai-extraction', timestamp: new Date().toISOString() });
});

// Routes
app.use('/extract', extractionRouter);

// Error handling
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`AI Extraction Service running on port ${PORT}`);
  });
}

module.exports = app;
