const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { asyncHandler, validate, schemas, AppError, getDb, logger } = require('@abha-sync/shared');
const { callService } = require('../services/serviceClient');

const router = express.Router();

/**
 * POST /api/consent-upload
 * 
 * Upload a record to ABHA with consent:
 * 1. Verify consent
 * 2. Retrieve FHIR bundle
 * 3. Call ABHA Mock Service
 * 4. Store consent log
 */
router.post('/', validate(schemas.consentUpload), asyncHandler(async (req, res) => {
  const { recordId, consents } = req.body;
  const userId = req.user?.userId || 'default-user';
  const db = getDb();

  // Get the record and FHIR bundle
  const record = db.prepare('SELECT * FROM records WHERE id = ?').get(recordId);
  if (!record) {
    throw new AppError('Record not found', 404);
  }

  const fhirBundle = db.prepare('SELECT bundle_json FROM fhir_bundles WHERE record_id = ?').get(recordId);
  if (!fhirBundle) {
    throw new AppError('FHIR bundle not found for this record', 404);
  }

  // Get user info
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

  // Call ABHA Mock Service
  logger.info(`Uploading record ${recordId} to ABHA...`);
  const abhaResult = await callService('abha', '/mock-abha/upload', {
    fhirBundle: JSON.parse(fhirBundle.bundle_json),
    consents,
    patientAbhaId: user?.abha_id || 'ABHA123456789',
  });

  // Store consent log
  const consentId = uuidv4();
  db.prepare(`
    INSERT INTO consent_logs (id, user_id, record_id, share_with_doctor, share_with_insurance, share_with_government, research_use, abha_upload_status, abha_response_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    consentId,
    userId,
    recordId,
    consents.shareWithDoctor ? 1 : 0,
    consents.shareWithInsurance ? 1 : 0,
    consents.shareWithGovernment ? 1 : 0,
    consents.researchUse ? 1 : 0,
    'uploaded',
    abhaResult.data?.responseToken || null
  );

  // Update record status
  db.prepare('UPDATE records SET status = ? WHERE id = ?').run('uploaded_to_abha', recordId);

  res.json({
    success: true,
    data: {
      consentId,
      recordId,
      abhaResponse: abhaResult.data,
      status: 'uploaded_to_abha',
    },
  });
}));

module.exports = router;
