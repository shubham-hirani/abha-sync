const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

module.exports = router;
