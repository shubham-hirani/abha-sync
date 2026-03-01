"use strict";

var express = require('express');

var _require = require('@abha-sync/shared'),
    asyncHandler = _require.asyncHandler,
    validate = _require.validate,
    schemas = _require.schemas;

var _require2 = require('../services/generator'),
    generateFHIRBundle = _require2.generateFHIRBundle,
    validateFHIRBundle = _require2.validateFHIRBundle;

var router = express.Router();
router.post('/', validate(schemas.fhirBundle), asyncHandler(function _callee(req, res) {
  var bundle, validation;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          bundle = generateFHIRBundle(req.body);
          validation = validateFHIRBundle(bundle);

          if (validation.valid) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            success: false,
            errors: validation.errors
          }));

        case 4:
          res.json({
            success: true,
            data: {
              bundle: bundle,
              validation: validation
            }
          });

        case 5:
        case "end":
          return _context.stop();
      }
    }
  });
}));
module.exports = router;