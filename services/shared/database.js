const Database = require('better-sqlite3');
const path = require('path');
const logger = require('./logger');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'abha-sync.db');

let db = null;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    logger.info(`SQLite database connected at ${DB_PATH}`);
  }
  return db;
}

function initializeDatabase() {
  const database = getDb();

  database.exec(`
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

  // Seed a default user for MVP
  const existingUser = database.prepare('SELECT id FROM users WHERE id = ?').get('default-user');
  if (!existingUser) {
    database.prepare(`
      INSERT INTO users (id, name, mobile, abha_id, email)
      VALUES (?, ?, ?, ?, ?)
    `).run('default-user', 'Rohan V.', '+919876543210', 'ABHA123456789', 'rohan@example.com');
  }

  logger.info('Database initialized with all tables');
  return database;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    logger.info('Database connection closed');
  }
}

module.exports = { getDb, initializeDatabase, closeDatabase };
