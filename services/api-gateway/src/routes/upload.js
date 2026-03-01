const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { asyncHandler, validate, schemas, getDb, logger } = require('@abha-sync/shared');
const { callService } = require('../services/serviceClient');

const router = express.Router();

/**
 * POST /api/upload
 * 
 * Main orchestration endpoint:
 * 1. Receives text
 * 2. Calls AI Extraction
 * 3. Calls Medical Normalization
 * 4. Calls FHIR Generator
 * 5. Stores everything in DB
 * 6. Returns structured response
 */
router.post('/', validate(schemas.uploadText), asyncHandler(async (req, res) => {
  const { text, fileName, fileType } = req.body;
  const recordId = uuidv4();
  const userId = req.user?.userId || 'default-user';

  logger.info(`Processing upload: recordId=${recordId}`);

  // Step 1: AI Extraction
  logger.info('Step 1: Calling AI Extraction service...');
  const extractionResult = await callService('extraction', '/extract', { text });
  const extracted = extractionResult.data;

  // Step 2: Medical Normalization
  logger.info('Step 2: Calling Medical Normalization service...');
  const diagnosisStr = Array.isArray(extracted.diagnosis) 
    ? extracted.diagnosis[0] 
    : extracted.diagnosis || 'General Consultation';

  const normalizationResult = await callService('normalization', '/normalize', {
    diagnosis: diagnosisStr,
    medicines: extracted.medicines || [],
  });
  const normalized = normalizationResult.data;

  // Step 3: FHIR Bundle Generation
  logger.info('Step 3: Calling FHIR Generator service...');
  const fhirInput = {
    patient: extracted.patient,
    doctor: extracted.doctor,
    diagnosis: diagnosisStr,
    medicines: extracted.medicines || [],
    labValues: extracted.labValues || [],
    icdCode: normalized.diagnosis?.icdCode,
    snomedCode: normalized.diagnosis?.snomedCode,
  };
  const fhirResult = await callService('fhir', '/generate', fhirInput);

  // Step 4: Store in database
  logger.info('Step 4: Storing in database...');
  const db = getDb();

  db.prepare(`
    INSERT INTO records (id, user_id, file_name, file_type, raw_text, extracted_data, normalized_data, confidence_score, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'processed')
  `).run(
    recordId,
    userId,
    fileName || 'upload.txt',
    fileType || 'other',
    text,
    JSON.stringify(extracted),
    JSON.stringify(normalized),
    extracted.confidenceScore || 0
  );

  // Store FHIR bundle
  const fhirBundleId = uuidv4();
  db.prepare(`
    INSERT INTO fhir_bundles (id, record_id, bundle_json)
    VALUES (?, ?, ?)
  `).run(fhirBundleId, recordId, JSON.stringify(fhirResult.data.bundle));

  logger.info(`Upload processed successfully: recordId=${recordId}`);

  // Step 5: Return complete response
  res.status(201).json({
    success: true,
    data: {
      recordId,
      extraction: extracted,
      normalization: normalized,
      fhirBundle: fhirResult.data.bundle,
      fhirValidation: fhirResult.data.validation,
      status: 'processed',
      createdAt: new Date().toISOString(),
    },
  });
}));

module.exports = router;
