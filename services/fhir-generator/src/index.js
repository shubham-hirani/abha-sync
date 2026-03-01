const express = require('express');
const cors = require('cors');
const { logger, errorHandler, rateLimiter } = require('@abha-sync/shared');
const fhirRouter = require('./routes/fhir');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter({ windowMs: 60000, maxRequests: 60 }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'fhir-generator', timestamp: new Date().toISOString() });
});

// Routes
app.use('/generate', fhirRouter);

// Error handling
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`FHIR Generator Service running on port ${PORT}`);
  });
}

module.exports = app;
