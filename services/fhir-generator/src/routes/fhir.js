const express = require('express');
const { asyncHandler, validate, schemas } = require('@abha-sync/shared');
const { generateFHIRBundle, validateFHIRBundle } = require('../services/generator');

const router = express.Router();

router.post('/', validate(schemas.fhirBundle), asyncHandler(async (req, res) => {
  const bundle = generateFHIRBundle(req.body);
  const validation = validateFHIRBundle(bundle);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      errors: validation.errors,
    });
  }

  res.json({
    success: true,
    data: {
      bundle,
      validation,
    },
  });
}));

module.exports = router;
