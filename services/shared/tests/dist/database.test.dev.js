"use strict";

var Database = require('better-sqlite3');

describe('Database Module', function () {
  var db;
  beforeEach(function () {
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON'); // Run migrations

    db.exec("\n      CREATE TABLE IF NOT EXISTS users (\n        id TEXT PRIMARY KEY,\n        name TEXT NOT NULL,\n        mobile TEXT UNIQUE,\n        abha_id TEXT UNIQUE,\n        email TEXT,\n        created_at TEXT DEFAULT (datetime('now')),\n        updated_at TEXT DEFAULT (datetime('now'))\n      );\n      CREATE TABLE IF NOT EXISTS records (\n        id TEXT PRIMARY KEY,\n        user_id TEXT,\n        file_name TEXT,\n        file_type TEXT DEFAULT 'other',\n        raw_text TEXT,\n        extracted_data TEXT,\n        normalized_data TEXT,\n        confidence_score REAL DEFAULT 0,\n        status TEXT DEFAULT 'pending',\n        created_at TEXT DEFAULT (datetime('now')),\n        updated_at TEXT DEFAULT (datetime('now')),\n        FOREIGN KEY (user_id) REFERENCES users(id)\n      );\n      CREATE TABLE IF NOT EXISTS fhir_bundles (\n        id TEXT PRIMARY KEY,\n        record_id TEXT UNIQUE,\n        bundle_json TEXT NOT NULL,\n        version TEXT DEFAULT '4.0.1',\n        created_at TEXT DEFAULT (datetime('now')),\n        FOREIGN KEY (record_id) REFERENCES records(id)\n      );\n      CREATE TABLE IF NOT EXISTS reminders (\n        id TEXT PRIMARY KEY,\n        user_id TEXT,\n        medication TEXT NOT NULL,\n        dosage TEXT,\n        frequency TEXT,\n        time TEXT,\n        enabled INTEGER DEFAULT 1,\n        created_at TEXT DEFAULT (datetime('now')),\n        FOREIGN KEY (user_id) REFERENCES users(id)\n      );\n      CREATE TABLE IF NOT EXISTS consent_logs (\n        id TEXT PRIMARY KEY,\n        user_id TEXT,\n        record_id TEXT,\n        share_with_doctor INTEGER DEFAULT 0,\n        share_with_insurance INTEGER DEFAULT 0,\n        share_with_government INTEGER DEFAULT 0,\n        research_use INTEGER DEFAULT 0,\n        abha_upload_status TEXT DEFAULT 'pending',\n        abha_response_token TEXT,\n        created_at TEXT DEFAULT (datetime('now')),\n        FOREIGN KEY (user_id) REFERENCES users(id),\n        FOREIGN KEY (record_id) REFERENCES records(id)\n      );\n    ");
  });
  afterEach(function () {
    db.close();
  });
  describe('Users Table', function () {
    test('should insert and retrieve a user', function () {
      db.prepare('INSERT INTO users (id, name, mobile, abha_id, email) VALUES (?, ?, ?, ?, ?)').run('user-1', 'Test User', '+919999999999', 'ABHA999999', 'test@example.com');
      var user = db.prepare('SELECT * FROM users WHERE id = ?').get('user-1');
      expect(user.name).toBe('Test User');
      expect(user.mobile).toBe('+919999999999');
    });
    test('should enforce unique mobile constraint', function () {
      db.prepare('INSERT INTO users (id, name, mobile) VALUES (?, ?, ?)').run('user-1', 'User 1', '+919999999999');
      expect(function () {
        db.prepare('INSERT INTO users (id, name, mobile) VALUES (?, ?, ?)').run('user-2', 'User 2', '+919999999999');
      }).toThrow();
    });
    test('should enforce unique ABHA ID constraint', function () {
      db.prepare('INSERT INTO users (id, name, abha_id) VALUES (?, ?, ?)').run('user-1', 'User 1', 'ABHA123');
      expect(function () {
        db.prepare('INSERT INTO users (id, name, abha_id) VALUES (?, ?, ?)').run('user-2', 'User 2', 'ABHA123');
      }).toThrow();
    });
  });
  describe('Records Table', function () {
    beforeEach(function () {
      db.prepare('INSERT INTO users (id, name) VALUES (?, ?)').run('user-1', 'Test');
    });
    test('should insert and retrieve a record', function () {
      db.prepare('INSERT INTO records (id, user_id, file_name, raw_text, status) VALUES (?, ?, ?, ?, ?)').run('rec-1', 'user-1', 'test.txt', 'Sample text', 'processed');
      var record = db.prepare('SELECT * FROM records WHERE id = ?').get('rec-1');
      expect(record.file_name).toBe('test.txt');
      expect(record.status).toBe('processed');
    });
    test('should store JSON extracted_data', function () {
      var data = JSON.stringify({
        patient: 'Test',
        diagnosis: 'Diabetes'
      });
      db.prepare('INSERT INTO records (id, user_id, extracted_data) VALUES (?, ?, ?)').run('rec-1', 'user-1', data);
      var record = db.prepare('SELECT * FROM records WHERE id = ?').get('rec-1');
      var parsed = JSON.parse(record.extracted_data);
      expect(parsed.diagnosis).toBe('Diabetes');
    });
  });
  describe('FHIR Bundles Table', function () {
    beforeEach(function () {
      db.prepare('INSERT INTO users (id, name) VALUES (?, ?)').run('user-1', 'Test');
      db.prepare('INSERT INTO records (id, user_id) VALUES (?, ?)').run('rec-1', 'user-1');
    });
    test('should insert FHIR bundle linked to record', function () {
      var bundle = JSON.stringify({
        resourceType: 'Bundle',
        type: 'transaction'
      });
      db.prepare('INSERT INTO fhir_bundles (id, record_id, bundle_json) VALUES (?, ?, ?)').run('fb-1', 'rec-1', bundle);
      var fhir = db.prepare('SELECT * FROM fhir_bundles WHERE record_id = ?').get('rec-1');
      expect(fhir).toBeDefined();
      var parsed = JSON.parse(fhir.bundle_json);
      expect(parsed.resourceType).toBe('Bundle');
    });
    test('should enforce unique record_id constraint', function () {
      db.prepare('INSERT INTO fhir_bundles (id, record_id, bundle_json) VALUES (?, ?, ?)').run('fb-1', 'rec-1', '{}');
      expect(function () {
        db.prepare('INSERT INTO fhir_bundles (id, record_id, bundle_json) VALUES (?, ?, ?)').run('fb-2', 'rec-1', '{}');
      }).toThrow();
    });
  });
  describe('Consent Logs Table', function () {
    beforeEach(function () {
      db.prepare('INSERT INTO users (id, name) VALUES (?, ?)').run('user-1', 'Test');
      db.prepare('INSERT INTO records (id, user_id) VALUES (?, ?)').run('rec-1', 'user-1');
    });
    test('should insert consent log', function () {
      db.prepare("INSERT INTO consent_logs (id, user_id, record_id, share_with_doctor, share_with_government)\n        VALUES (?, ?, ?, ?, ?)").run('cl-1', 'user-1', 'rec-1', 1, 1);
      var consent = db.prepare('SELECT * FROM consent_logs WHERE id = ?').get('cl-1');
      expect(consent.share_with_doctor).toBe(1);
      expect(consent.share_with_government).toBe(1);
    });
  });
  describe('Reminders Table', function () {
    beforeEach(function () {
      db.prepare('INSERT INTO users (id, name) VALUES (?, ?)').run('user-1', 'Test');
    });
    test('should insert and retrieve reminder', function () {
      db.prepare('INSERT INTO reminders (id, user_id, medication, dosage, frequency, time) VALUES (?, ?, ?, ?, ?, ?)').run('rem-1', 'user-1', 'Metformin', '500mg', 'Twice daily', '09:00');
      var reminder = db.prepare('SELECT * FROM reminders WHERE id = ?').get('rem-1');
      expect(reminder.medication).toBe('Metformin');
      expect(reminder.enabled).toBe(1);
    });
  });
});