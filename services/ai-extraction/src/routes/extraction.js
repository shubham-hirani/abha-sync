const express = require('express');
const { asyncHandler, validate, schemas } = require('@abha-sync/shared');
const { extractMedicalData } = require('../services/extractor');

const router = express.Router();

router.post('/', validate(schemas.extraction), asyncHandler(async (req, res) => {
  const { text } = req.body;
  const result = extractMedicalData(text);
  res.json({ success: true, data: result });
}));

module.exports = router;
