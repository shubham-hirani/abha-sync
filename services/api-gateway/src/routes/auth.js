const express = require('express');
const { asyncHandler, AppError, generateToken, validate, schemas } = require('@abha-sync/shared');

const router = express.Router();

// Mock OTP storage (in production, use Redis or DB)
const otpStore = new Map();

/**
 * POST /api/auth/send-otp
 */
router.post('/send-otp', validate(schemas.login), asyncHandler(async (req, res) => {
  const { mobile, abhaId } = req.body;
  const identifier = mobile || abhaId;

  // Generate a mock OTP (always 123456 for MVP testing)
  const otp = '123456';
  otpStore.set(identifier, { otp, expiresAt: Date.now() + 300000 }); // 5 min

  res.json({
    success: true,
    data: {
      message: `OTP sent to ${mobile ? 'mobile' : 'ABHA ID'}: ${identifier}`,
      // In production, never send OTP in response. This is for MVP demo only.
      _devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    },
  });
}));

/**
 * POST /api/auth/verify-otp
 */
router.post('/verify-otp', validate(schemas.verifyOtp), asyncHandler(async (req, res) => {
  const { mobile, abhaId, otp } = req.body;
  const identifier = mobile || abhaId;

  const stored = otpStore.get(identifier);
  if (!stored) {
    throw new AppError('No OTP found. Please request a new one.', 400);
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(identifier);
    throw new AppError('OTP expired. Please request a new one.', 400);
  }

  if (stored.otp !== otp) {
    throw new AppError('Invalid OTP', 401);
  }

  otpStore.delete(identifier);

  // Generate JWT token
  const token = generateToken({
    userId: 'default-user',
    mobile: mobile || null,
    abhaId: abhaId || 'ABHA123456789',
  });

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: 'default-user',
        name: 'Rohan V.',
        mobile: mobile || '+919876543210',
        abhaId: abhaId || 'ABHA123456789',
        email: 'rohan@example.com',
      },
    },
  });
}));

module.exports = router;
