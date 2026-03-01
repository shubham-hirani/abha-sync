const express = require('express');
const { asyncHandler, AppError, getDb } = require('@abha-sync/shared');

const router = express.Router();

/**
 * GET /api/records
 * Get all records for the current user
 */
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user?.userId || 'default-user';
  const db = getDb();

  const records = db.prepare(`
    SELECT r.*, fb.bundle_json
    FROM records r
    LEFT JOIN fhir_bundles fb ON r.id = fb.record_id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `).all(userId);

  const formattedRecords = records.map((r) => ({
    id: r.id,
    fileName: r.file_name,
    fileType: r.file_type,
    extractedData: r.extracted_data ? JSON.parse(r.extracted_data) : null,
    normalizedData: r.normalized_data ? JSON.parse(r.normalized_data) : null,
    confidenceScore: r.confidence_score,
    status: r.status,
    hasFhirBundle: !!r.bundle_json,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  res.json({
    success: true,
    data: {
      records: formattedRecords,
      total: formattedRecords.length,
    },
  });
}));

/**
 * GET /api/records/:id
 * Get a single record with full details
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDb();

  const record = db.prepare(`
    SELECT r.*, fb.bundle_json
    FROM records r
    LEFT JOIN fhir_bundles fb ON r.id = fb.record_id
    WHERE r.id = ?
  `).get(id);

  if (!record) {
    throw new AppError('Record not found', 404);
  }

  const consent = db.prepare('SELECT * FROM consent_logs WHERE record_id = ?').get(id);

  res.json({
    success: true,
    data: {
      id: record.id,
      fileName: record.file_name,
      fileType: record.file_type,
      rawText: record.raw_text,
      extractedData: record.extracted_data ? JSON.parse(record.extracted_data) : null,
      normalizedData: record.normalized_data ? JSON.parse(record.normalized_data) : null,
      fhirBundle: record.bundle_json ? JSON.parse(record.bundle_json) : null,
      confidenceScore: record.confidence_score,
      status: record.status,
      consent: consent
        ? {
            shareWithDoctor: !!consent.share_with_doctor,
            shareWithInsurance: !!consent.share_with_insurance,
            shareWithGovernment: !!consent.share_with_government,
            researchUse: !!consent.research_use,
            abhaUploadStatus: consent.abha_upload_status,
          }
        : null,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    },
  });
}));

module.exports = router;
