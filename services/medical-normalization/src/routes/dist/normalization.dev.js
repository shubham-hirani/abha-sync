"use strict";

var express = require('express');

var _require = require('@abha-sync/shared'),
    asyncHandler = _require.asyncHandler,
    validate = _require.validate,
    schemas = _require.schemas;

var _require2 = require('../services/normalizer'),
    normalizeDiagnosis = _require2.normalizeDiagnosis,
    normalizeMedicines = _require2.normalizeMedicines;

var router = express.Router();
router.post('/', validate(schemas.normalization), asyncHandler(function _callee(req, res) {
  var _req$body, diagnosis, medicines, normalizedDiagnosis, normalizedMedicines;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, diagnosis = _req$body.diagnosis, medicines = _req$body.medicines;
          normalizedDiagnosis = normalizeDiagnosis(diagnosis);
          normalizedMedicines = medicines ? medicines.map(normalizeMedicines) : [];
          res.json({
            success: true,
            data: {
              diagnosis: normalizedDiagnosis,
              medicines: normalizedMedicines
            }
          });

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
}));
module.exports = router;