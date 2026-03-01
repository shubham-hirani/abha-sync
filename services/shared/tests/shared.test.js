const { AppError, errorHandler, asyncHandler } = require('../errorHandler');
const { validate, schemas } = require('../validation');
const { generateToken, verifyToken } = require('../auth');
const { rateLimiter } = require('../rateLimiter');

describe('Shared Module', () => {
  describe('AppError', () => {
    test('should create error with message and status', () => {
      const err = new AppError('Test error', 400);
      expect(err.message).toBe('Test error');
      expect(err.statusCode).toBe(400);
      expect(err.isOperational).toBe(true);
    });

    test('should default to 500 status code', () => {
      const err = new AppError('Server error');
      expect(err.statusCode).toBe(500);
    });
  });

  describe('Auth', () => {
    test('should generate and verify JWT token', () => {
      const payload = { userId: 'test-user', mobile: '+919876543210' };
      const token = generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = verifyToken(token);
      expect(decoded.userId).toBe('test-user');
      expect(decoded.mobile).toBe('+919876543210');
    });

    test('should reject invalid token', () => {
      expect(() => verifyToken('invalid.token.here')).toThrow();
    });
  });

  describe('Validation Schemas', () => {
    test('uploadText schema should validate properly', () => {
      const { error } = schemas.uploadText.validate({
        text: 'This is a valid medical text with enough characters',
      });
      expect(error).toBeUndefined();
    });

    test('uploadText schema should reject short text', () => {
      const { error } = schemas.uploadText.validate({ text: 'short' });
      expect(error).toBeDefined();
    });

    test('login schema should require mobile or abhaId', () => {
      const { error } = schemas.login.validate({});
      expect(error).toBeDefined();
    });

    test('login schema should accept valid mobile', () => {
      const { error } = schemas.login.validate({ mobile: '+919876543210' });
      expect(error).toBeUndefined();
    });

    test('verifyOtp schema should require 6-digit OTP', () => {
      const { error } = schemas.verifyOtp.validate({ mobile: '+919876543210', otp: '123' });
      expect(error).toBeDefined();
    });
  });

  describe('Rate Limiter', () => {
    test('should create middleware function', () => {
      const limiter = rateLimiter({ windowMs: 1000, maxRequests: 5 });
      expect(typeof limiter).toBe('function');
    });

    test('should allow requests within limit', () => {
      const limiter = rateLimiter({ windowMs: 1000, maxRequests: 5 });
      const req = { ip: '127.0.0.1' };
      const res = {};
      const next = jest.fn();

      limiter(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });
  });
});
