"use strict";

/**
 * Database migration script
 * Run with: node src/migrate.js
 */
process.env.SERVICE_NAME = 'migration';

var _require = require('@abha-sync/shared'),
    initializeDatabase = _require.initializeDatabase,
    closeDatabase = _require.closeDatabase,
    logger = _require.logger;

var path = require('path');

var fs = require('fs'); // Ensure data directory exists


var dataDir = process.env.DB_PATH ? path.dirname(process.env.DB_PATH) : path.join(__dirname, '..', '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, {
    recursive: true
  });
  logger.info("Created data directory: ".concat(dataDir));
}

try {
  initializeDatabase();
  logger.info('Migration completed successfully');
} catch (err) {
  logger.error("Migration failed: ".concat(err.message));
  process.exit(1);
} finally {
  closeDatabase();
}