"use strict";

var Database = require('better-sqlite3');

var path = require('path');

var logger = require('./logger');

var DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'abha-sync.db');
var db = null;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    logger.info("SQLite database connected at ".concat(DB_PATH));
  }

  return db;
}

function initializeDatabase() {
  var database = getDb();
  database.exec("\n    CREATE TABLE IF NOT EXISTS users (\n      id TEXT PRIMARY KEY,\n      name TEXT NOT NULL,\n      mobile TEXT UNIQUE,\n      abha_id TEXT UNIQUE,\n      email TEXT,\n      created_at TEXT DEFAULT (datetime('now')),\n      updated_at TEXT DEFAULT (datetime('now'))\n    );\n\n    CREATE TABLE IF NOT EXISTS records (\n      id TEXT PRIMARY KEY,\n      user_id TEXT,\n      file_name TEXT,\n      file_type TEXT DEFAULT 'other',\n      raw_text TEXT,\n      extracted_data TEXT,\n      normalized_data TEXT,\n      confidence_score REAL DEFAULT 0,\n      status TEXT DEFAULT 'pending',\n      created_at TEXT DEFAULT (datetime('now')),\n      updated_at TEXT DEFAULT (datetime('now')),\n      FOREIGN KEY (user_id) REFERENCES users(id)\n    );\n\n    CREATE TABLE IF NOT EXISTS fhir_bundles (\n      id TEXT PRIMARY KEY,\n      record_id TEXT UNIQUE,\n      bundle_json TEXT NOT NULL,\n      version TEXT DEFAULT '4.0.1',\n      created_at TEXT DEFAULT (datetime('now')),\n      FOREIGN KEY (record_id) REFERENCES records(id)\n    );\n\n    CREATE TABLE IF NOT EXISTS reminders (\n      id TEXT PRIMARY KEY,\n      user_id TEXT,\n      medication TEXT NOT NULL,\n      dosage TEXT,\n      frequency TEXT,\n      time TEXT,\n      enabled INTEGER DEFAULT 1,\n      created_at TEXT DEFAULT (datetime('now')),\n      FOREIGN KEY (user_id) REFERENCES users(id)\n    );\n\n    CREATE TABLE IF NOT EXISTS consent_logs (\n      id TEXT PRIMARY KEY,\n      user_id TEXT,\n      record_id TEXT,\n      share_with_doctor INTEGER DEFAULT 0,\n      share_with_insurance INTEGER DEFAULT 0,\n      share_with_government INTEGER DEFAULT 0,\n      research_use INTEGER DEFAULT 0,\n      abha_upload_status TEXT DEFAULT 'pending',\n      abha_response_token TEXT,\n      created_at TEXT DEFAULT (datetime('now')),\n      FOREIGN KEY (user_id) REFERENCES users(id),\n      FOREIGN KEY (record_id) REFERENCES records(id)\n    );\n  "); // Seed a default user for MVP

  var existingUser = database.prepare('SELECT id FROM users WHERE id = ?').get('default-user');

  if (!existingUser) {
    database.prepare("\n      INSERT INTO users (id, name, mobile, abha_id, email)\n      VALUES (?, ?, ?, ?, ?)\n    ").run('default-user', 'Rohan V.', '+919876543210', 'ABHA123456789', 'rohan@example.com');
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

module.exports = {
  getDb: getDb,
  initializeDatabase: initializeDatabase,
  closeDatabase: closeDatabase
};