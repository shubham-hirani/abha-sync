"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _require = require('../errorHandler'),
    AppError = _require.AppError,
    errorHandler = _require.errorHandler,
    asyncHandler = _require.asyncHandler;

var _require2 = require('../validation'),
    validate = _require2.validate,
    schemas = _require2.schemas;

var _require3 = require('../auth'),
    generateToken = _require3.generateToken,
    verifyToken = _require3.verifyToken;

var _require4 = require('../rateLimiter'),
    rateLimiter = _require4.rateLimiter;

describe('Shared Module', function () {
  describe('AppError', function () {
    test('should create error with message and status', function () {
      var err = new AppError('Test error', 400);
      expect(err.message).toBe('Test error');
      expect(err.statusCode).toBe(400);
      expect(err.isOperational).toBe(true);
    });
    test('should default to 500 status code', function () {
      var err = new AppError('Server error');
      expect(err.statusCode).toBe(500);
    });
  });
  describe('Auth', function () {
    test('should generate and verify JWT token', function () {
      var payload = {
        userId: 'test-user',
        mobile: '+919876543210'
      };
      var token = generateToken(payload);
      expect(token).toBeDefined();
      expect(_typeof(token)).toBe('string');
      var decoded = verifyToken(token);
      expect(decoded.userId).toBe('test-user');
      expect(decoded.mobile).toBe('+919876543210');
    });
    test('should reject invalid token', function () {
      expect(function () {
        return verifyToken('invalid.token.here');
      }).toThrow();
    });
  });
  describe('Validation Schemas', function () {
    test('uploadText schema should validate properly', function () {
      var _schemas$uploadText$v = schemas.uploadText.validate({
        text: 'This is a valid medical text with enough characters'
      }),
          error = _schemas$uploadText$v.error;

      expect(error).toBeUndefined();
    });
    test('uploadText schema should reject short text', function () {
      var _schemas$uploadText$v2 = schemas.uploadText.validate({
        text: 'short'
      }),
          error = _schemas$uploadText$v2.error;

      expect(error).toBeDefined();
    });
    test('login schema should require mobile or abhaId', function () {
      var _schemas$login$valida = schemas.login.validate({}),
          error = _schemas$login$valida.error;

      expect(error).toBeDefined();
    });
    test('login schema should accept valid mobile', function () {
      var _schemas$login$valida2 = schemas.login.validate({
        mobile: '+919876543210'
      }),
          error = _schemas$login$valida2.error;

      expect(error).toBeUndefined();
    });
    test('verifyOtp schema should require 6-digit OTP', function () {
      var _schemas$verifyOtp$va = schemas.verifyOtp.validate({
        mobile: '+919876543210',
        otp: '123'
      }),
          error = _schemas$verifyOtp$va.error;

      expect(error).toBeDefined();
    });
  });
  describe('Rate Limiter', function () {
    test('should create middleware function', function () {
      var limiter = rateLimiter({
        windowMs: 1000,
        maxRequests: 5
      });
      expect(_typeof(limiter)).toBe('function');
    });
    test('should allow requests within limit', function () {
      var limiter = rateLimiter({
        windowMs: 1000,
        maxRequests: 5
      });
      var req = {
        ip: '127.0.0.1'
      };
      var res = {};
      var next = jest.fn();
      limiter(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });
  });
});