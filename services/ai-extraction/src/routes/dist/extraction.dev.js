"use strict";

var express = require('express');

var _require = require('@abha-sync/shared'),
    asyncHandler = _require.asyncHandler,
    validate = _require.validate,
    schemas = _require.schemas;

var _require2 = require('../services/extractor'),
    extractMedicalData = _require2.extractMedicalData;

var router = express.Router();
router.post('/', validate(schemas.extraction), asyncHandler(function _callee(req, res) {
  var text, result;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          text = req.body.text;
          result = extractMedicalData(text);
          res.json({
            success: true,
            data: result
          });

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
}));
module.exports = router;