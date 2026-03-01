const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { asyncHandler, AppError, getDb } = require('@abha-sync/shared');

const router = express.Router();

/**
 * GET /api/reminders
 */
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user?.userId || 'default-user';
  const db = getDb();
  const reminders = db.prepare('SELECT * FROM reminders WHERE user_id = ? ORDER BY time').all(userId);

  res.json({
    success: true,
    data: { reminders },
  });
}));

/**
 * POST /api/reminders
 */
router.post('/', asyncHandler(async (req, res) => {
  const userId = req.user?.userId || 'default-user';
  const { medication, dosage, frequency, time } = req.body;

  if (!medication) {
    throw new AppError('Medication name is required', 400);
  }

  const db = getDb();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO reminders (id, user_id, medication, dosage, frequency, time) 
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, medication, dosage || '', frequency || 'Daily', time || '09:00');

  res.status(201).json({
    success: true,
    data: { id, medication, dosage, frequency, time, enabled: true },
  });
}));

/**
 * PUT /api/reminders/:id
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { enabled, medication, dosage, frequency, time } = req.body;
  const db = getDb();

  const existing = db.prepare('SELECT * FROM reminders WHERE id = ?').get(id);
  if (!existing) {
    throw new AppError('Reminder not found', 404);
  }

  db.prepare(`
    UPDATE reminders SET medication = ?, dosage = ?, frequency = ?, time = ?, enabled = ?
    WHERE id = ?
  `).run(
    medication || existing.medication,
    dosage || existing.dosage,
    frequency || existing.frequency,
    time || existing.time,
    enabled !== undefined ? (enabled ? 1 : 0) : existing.enabled,
    id
  );

  res.json({ success: true, data: { id, message: 'Reminder updated' } });
}));

/**
 * DELETE /api/reminders/:id
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDb();

  const result = db.prepare('DELETE FROM reminders WHERE id = ?').run(id);
  if (result.changes === 0) {
    throw new AppError('Reminder not found', 404);
  }

  res.json({ success: true, data: { message: 'Reminder deleted' } });
}));

module.exports = router;
