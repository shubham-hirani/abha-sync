const express = require('express');
const cors = require('cors');
const { logger, errorHandler, rateLimiter } = require('@abha-sync/shared');
const abhaRouter = require('./routes/abha');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter({ windowMs: 60000, maxRequests: 30 }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'abha-mock-service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/mock-abha', abhaRouter);

// Error handling
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`ABHA Mock Service running on port ${PORT}`);
  });
}

module.exports = app;
