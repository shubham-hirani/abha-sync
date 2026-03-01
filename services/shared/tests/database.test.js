const Database = require('better-sqlite3');

describe('Database Module', () => {
  let db;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Run migrations
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
  });

  afterEach(() => {
    db.close();
  });

  describe('Users Table', () => {
    test('should insert and retrieve a user', () => {
      db.prepare('INSERT INTO users (id, name, mobile, abha_id, email) VALUES (?, ?, ?, ?, ?)')
        .run('user-1', 'Test User', '+919999999999', 'ABHA999999', 'test@example.com');

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get('user-1');
      expect(user.name).toBe('Test User');
      expect(user.mobile).toBe('+919999999999');
    });

    test('should enforce unique mobile constraint', () => {
      db.prepare('INSERT INTO users (id, name, mobile) VALUES (?, ?, ?)')
        .run('user-1', 'User 1', '+919999999999');

      expect(() => {
        db.prepare('INSERT INTO users (id, name, mobile) VALUES (?, ?, ?)')
          .run('user-2', 'User 2', '+919999999999');
      }).toThrow();
    });

    test('should enforce unique ABHA ID constraint', () => {
      db.prepare('INSERT INTO users (id, name, abha_id) VALUES (?, ?, ?)')
        .run('user-1', 'User 1', 'ABHA123');

      expect(() => {
        db.prepare('INSERT INTO users (id, name, abha_id) VALUES (?, ?, ?)')
          .run('user-2', 'User 2', 'ABHA123');
      }).toThrow();
    });
  });

  describe('Records Table', () => {
    beforeEach(() => {
      db.prepare('INSERT INTO users (id, name) VALUES (?, ?)').run('user-1', 'Test');
    });

    test('should insert and retrieve a record', () => {
      db.prepare('INSERT INTO records (id, user_id, file_name, raw_text, status) VALUES (?, ?, ?, ?, ?)')
        .run('rec-1', 'user-1', 'test.txt', 'Sample text', 'processed');

      const record = db.prepare('SELECT * FROM records WHERE id = ?').get('rec-1');
      expect(record.file_name).toBe('test.txt');
      expect(record.status).toBe('processed');
    });

    test('should store JSON extracted_data', () => {
      const data = JSON.stringify({ patient: 'Test', diagnosis: 'Diabetes' });
      db.prepare('INSERT INTO records (id, user_id, extracted_data) VALUES (?, ?, ?)')
        .run('rec-1', 'user-1', data);

      const record = db.prepare('SELECT * FROM records WHERE id = ?').get('rec-1');
      const parsed = JSON.parse(record.extracted_data);
      expect(parsed.diagnosis).toBe('Diabetes');
    });
  });

  describe('FHIR Bundles Table', () => {
    beforeEach(() => {
      db.prepare('INSERT INTO users (id, name) VALUES (?, ?)').run('user-1', 'Test');
      db.prepare('INSERT INTO records (id, user_id) VALUES (?, ?)').run('rec-1', 'user-1');
    });

    test('should insert FHIR bundle linked to record', () => {
      const bundle = JSON.stringify({ resourceType: 'Bundle', type: 'transaction' });
      db.prepare('INSERT INTO fhir_bundles (id, record_id, bundle_json) VALUES (?, ?, ?)')
        .run('fb-1', 'rec-1', bundle);

      const fhir = db.prepare('SELECT * FROM fhir_bundles WHERE record_id = ?').get('rec-1');
      expect(fhir).toBeDefined();
      const parsed = JSON.parse(fhir.bundle_json);
      expect(parsed.resourceType).toBe('Bundle');
    });

    test('should enforce unique record_id constraint', () => {
      db.prepare('INSERT INTO fhir_bundles (id, record_id, bundle_json) VALUES (?, ?, ?)')
        .run('fb-1', 'rec-1', '{}');

      expect(() => {
        db.prepare('INSERT INTO fhir_bundles (id, record_id, bundle_json) VALUES (?, ?, ?)')
          .run('fb-2', 'rec-1', '{}');
      }).toThrow();
    });
  });

  describe('Consent Logs Table', () => {
    beforeEach(() => {
      db.prepare('INSERT INTO users (id, name) VALUES (?, ?)').run('user-1', 'Test');
      db.prepare('INSERT INTO records (id, user_id) VALUES (?, ?)').run('rec-1', 'user-1');
    });

    test('should insert consent log', () => {
      db.prepare(`INSERT INTO consent_logs (id, user_id, record_id, share_with_doctor, share_with_government)
        VALUES (?, ?, ?, ?, ?)`).run('cl-1', 'user-1', 'rec-1', 1, 1);

      const consent = db.prepare('SELECT * FROM consent_logs WHERE id = ?').get('cl-1');
      expect(consent.share_with_doctor).toBe(1);
      expect(consent.share_with_government).toBe(1);
    });
  });

  describe('Reminders Table', () => {
    beforeEach(() => {
      db.prepare('INSERT INTO users (id, name) VALUES (?, ?)').run('user-1', 'Test');
    });

    test('should insert and retrieve reminder', () => {
      db.prepare('INSERT INTO reminders (id, user_id, medication, dosage, frequency, time) VALUES (?, ?, ?, ?, ?, ?)')
        .run('rem-1', 'user-1', 'Metformin', '500mg', 'Twice daily', '09:00');

      const reminder = db.prepare('SELECT * FROM reminders WHERE id = ?').get('rem-1');
      expect(reminder.medication).toBe('Metformin');
      expect(reminder.enabled).toBe(1);
    });
  });
});
