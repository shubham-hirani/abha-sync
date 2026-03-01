"use strict";

var express = require('express');

var _require = require('@abha-sync/shared'),
    asyncHandler = _require.asyncHandler,
    AppError = _require.AppError,
    generateToken = _require.generateToken,
    validate = _require.validate,
    schemas = _require.schemas;

var router = express.Router(); // Mock OTP storage (in production, use Redis or DB)

var otpStore = new Map();
/**
 * POST /api/auth/send-otp
 */

router.post('/send-otp', validate(schemas.login), asyncHandler(function _callee(req, res) {
  var _req$body, mobile, abhaId, identifier, otp;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, mobile = _req$body.mobile, abhaId = _req$body.abhaId;
          identifier = mobile || abhaId; // Generate a mock OTP (always 123456 for MVP testing)

          otp = '123456';
          otpStore.set(identifier, {
            otp: otp,
            expiresAt: Date.now() + 300000
          }); // 5 min

          res.json({
            success: true,
            data: {
              message: "OTP sent to ".concat(mobile ? 'mobile' : 'ABHA ID', ": ").concat(identifier),
              // In production, never send OTP in response. This is for MVP demo only.
              _devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
            }
          });

        case 5:
        case "end":
          return _context.stop();
      }
    }
  });
}));
/**
 * POST /api/auth/verify-otp
 */

router.post('/verify-otp', validate(schemas.verifyOtp), asyncHandler(function _callee2(req, res) {
  var _req$body2, mobile, abhaId, otp, identifier, stored, token;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body2 = req.body, mobile = _req$body2.mobile, abhaId = _req$body2.abhaId, otp = _req$body2.otp;
          identifier = mobile || abhaId;
          stored = otpStore.get(identifier);

          if (stored) {
            _context2.next = 5;
            break;
          }

          throw new AppError('No OTP found. Please request a new one.', 400);

        case 5:
          if (!(Date.now() > stored.expiresAt)) {
            _context2.next = 8;
            break;
          }

          otpStore["delete"](identifier);
          throw new AppError('OTP expired. Please request a new one.', 400);

        case 8:
          if (!(stored.otp !== otp)) {
            _context2.next = 10;
            break;
          }

          throw new AppError('Invalid OTP', 401);

        case 10:
          otpStore["delete"](identifier); // Generate JWT token

          token = generateToken({
            userId: 'default-user',
            mobile: mobile || null,
            abhaId: abhaId || 'ABHA123456789'
          });
          res.json({
            success: true,
            data: {
              token: token,
              user: {
                id: 'default-user',
                name: 'Rohan V.',
                mobile: mobile || '+919876543210',
                abhaId: abhaId || 'ABHA123456789',
                email: 'rohan@example.com'
              }
            }
          });

        case 13:
        case "end":
          return _context2.stop();
      }
    }
  });
}));
module.exports = router;