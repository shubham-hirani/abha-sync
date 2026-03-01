const request = require('supertest');

// Mock the database before importing app
jest.mock('@abha-sync/shared', () => {
  const actual = jest.requireActual('@abha-sync/shared');
  const Database = require('better-sqlite3');
  const db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables  
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mobile TEXT UNIQUE,
      abha_id TEXT UNIQUE,
      email TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      file_name TEXT,
      file_type TEXT DEFAULT 'other',
      raw_text TEXT,
      extracted_data TEXT,
      normalized_data TEXT,
      confidence_score REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS fhir_bundles (
      id TEXT PRIMARY KEY,
      record_id TEXT UNIQUE,
      bundle_json TEXT NOT NULL,
      version TEXT DEFAULT '4.0.1',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (record_id) REFERENCES records(id)
    );
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      medication TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT,
      time TEXT,
      enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS consent_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      record_id TEXT,
      share_with_doctor INTEGER DEFAULT 0,
      share_with_insurance INTEGER DEFAULT 0,
      share_with_government INTEGER DEFAULT 0,
      research_use INTEGER DEFAULT 0,
      abha_upload_status TEXT DEFAULT 'pending',
      abha_response_token TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (record_id) REFERENCES records(id)
    );
  `);

  // Seed user
  db.prepare("INSERT OR IGNORE INTO users (id, name, mobile, abha_id, email) VALUES (?, ?, ?, ?, ?)")
    .run('default-user', 'Rohan V.', '+919876543210', 'ABHA123456789', 'rohan@example.com');

  return {
    ...actual,
    getDb: () => db,
    initializeDatabase: () => db,
    closeDatabase: () => {},
  };
});

const app = require('../src/index');

describe('API Gateway', () => {
  describe('Health Check', () => {
    test('GET /api/health should return healthy', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('api-gateway');
    });
  });

  describe('Auth', () => {
    test('POST /api/auth/send-otp should accept valid mobile', async () => {
      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({ mobile: '+919876543210' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('POST /api/auth/verify-otp should return token for valid OTP', async () => {
      // First send OTP
      await request(app)
        .post('/api/auth/send-otp')
        .send({ mobile: '+919876543210' });

      // Then verify
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ mobile: '+919876543210', otp: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user).toBeDefined();
    });

    test('POST /api/auth/verify-otp should reject invalid OTP', async () => {
      await request(app)
        .post('/api/auth/send-otp')
        .send({ mobile: '+919876543210' });

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ mobile: '+919876543210', otp: '000000' });

      expect(res.status).toBe(401);
    });
  });

  describe('Records', () => {
    test('GET /api/records should return records list', async () => {
      const res = await request(app).get('/api/records');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.records)).toBe(true);
    });

    test('GET /api/records/:id should return 404 for non-existent record', async () => {
      const res = await request(app).get('/api/records/non-existent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('Reminders', () => {
    let reminderId;

    test('POST /api/reminders should create a reminder', async () => {
      const res = await request(app)
        .post('/api/reminders')
        .send({ medication: 'Metformin', dosage: '500mg', frequency: 'Twice daily', time: '09:00' });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      reminderId = res.body.data.id;
    });

    test('GET /api/reminders should return reminders', async () => {
      const res = await request(app).get('/api/reminders');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.reminders)).toBe(true);
    });

    test('PUT /api/reminders/:id should update reminder', async () => {
      if (!reminderId) return;
      const res = await request(app)
        .put(`/api/reminders/${reminderId}`)
        .send({ enabled: false });

      expect(res.status).toBe(200);
    });

    test('DELETE /api/reminders/:id should delete reminder', async () => {
      if (!reminderId) return;
      const res = await request(app).delete(`/api/reminders/${reminderId}`);
      expect(res.status).toBe(200);
    });

    test('DELETE /api/reminders/:id should 404 for non-existent', async () => {
      const res = await request(app).delete('/api/reminders/fake-id');
      expect(res.status).toBe(404);
    });
  });
});
