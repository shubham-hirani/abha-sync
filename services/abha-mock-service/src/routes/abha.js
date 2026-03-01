const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { asyncHandler, AppError } = require('@abha-sync/shared');

const router = express.Router();

/**
 * POST /mock-abha/upload
 * Simulate ABHA government API health record upload
 */
router.post('/upload', asyncHandler(async (req, res) => {
  const { fhirBundle, consents, patientAbhaId } = req.body;

  // Validate required fields
  if (!fhirBundle) {
    throw new AppError('FHIR Bundle is required', 400);
  }

  if (!consents) {
    throw new AppError('Consent information is required', 400);
  }

  // Verify consent - at least one consent must be granted
  const hasConsent = consents.shareWithDoctor || consents.shareWithGovernment;
  if (!hasConsent) {
    throw new AppError('Upload rejected: No valid consent provided. At least doctor or government sharing must be enabled.', 403);
  }

  // Simulate processing delay (50-200ms)
  await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 150));

  // Simulate occasional failures (5% chance in non-test env)
  if (process.env.NODE_ENV !== 'test' && Math.random() < 0.05) {
    throw new AppError('ABHA service temporarily unavailable. Please retry.', 503);
  }

  // Generate mock response
  const responseToken = uuidv4();
  const transactionId = `ABHA-TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  res.json({
    success: true,
    data: {
      transactionId,
      responseToken,
      status: 'ACCEPTED',
      message: 'Health record successfully uploaded to ABHA',
      patientAbhaId: patientAbhaId || 'ABHA-UNKNOWN',
      timestamp: new Date().toISOString(),
      resourcesProcessed: fhirBundle.entry?.length || 0,
      consentsRecorded: {
        shareWithDoctor: !!consents.shareWithDoctor,
        shareWithInsurance: !!consents.shareWithInsurance,
        shareWithGovernment: !!consents.shareWithGovernment,
        researchUse: !!consents.researchUse,
      },
    },
  });
}));

/**
 * GET /mock-abha/status/:transactionId
 * Check upload status
 */
router.get('/status/:transactionId', asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  // Simulate status check
  res.json({
    success: true,
    data: {
      transactionId,
      status: 'COMPLETED',
      message: 'Health record processing completed',
      timestamp: new Date().toISOString(),
    },
  });
}));

/**
 * POST /mock-abha/verify
 * Verify ABHA ID
 */
router.post('/verify', asyncHandler(async (req, res) => {
  const { abhaId } = req.body;

  if (!abhaId) {
    throw new AppError('ABHA ID is required', 400);
  }

  // Mock verification - accept any ID starting with ABHA
  const isValid = abhaId.startsWith('ABHA') || /^\d{14}$/.test(abhaId);

  res.json({
    success: true,
    data: {
      abhaId,
      verified: isValid,
      status: isValid ? 'VERIFIED' : 'NOT_FOUND',
      message: isValid ? 'ABHA ID verified successfully' : 'ABHA ID not found in registry',
    },
  });
}));

module.exports = router;
