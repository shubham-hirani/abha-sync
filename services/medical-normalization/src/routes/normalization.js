const express = require('express');
const { asyncHandler, validate, schemas } = require('@abha-sync/shared');
const { normalizeDiagnosis, normalizeMedicines } = require('../services/normalizer');

const router = express.Router();

router.post('/', validate(schemas.normalization), asyncHandler(async (req, res) => {
  const { diagnosis, medicines } = req.body;

  const normalizedDiagnosis = normalizeDiagnosis(diagnosis);
  const normalizedMedicines = medicines ? medicines.map(normalizeMedicines) : [];

  res.json({
    success: true,
    data: {
      diagnosis: normalizedDiagnosis,
      medicines: normalizedMedicines,
    },
  });
}));

module.exports = router;
