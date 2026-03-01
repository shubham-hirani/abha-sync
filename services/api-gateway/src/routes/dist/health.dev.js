"use strict";

var express = require('express');

var router = express.Router();
router.get('/', function (_req, res) {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});
module.exports = router;