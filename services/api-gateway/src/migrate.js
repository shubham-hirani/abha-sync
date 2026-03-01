/**
 * Database migration script
 * Run with: node src/migrate.js
 */

process.env.SERVICE_NAME = 'migration';

const { initializeDatabase, closeDatabase, logger } = require('@abha-sync/shared');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = process.env.DB_PATH 
  ? path.dirname(process.env.DB_PATH)
  : path.join(__dirname, '..', '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  logger.info(`Created data directory: ${dataDir}`);
}

try {
  initializeDatabase();
  logger.info('Migration completed successfully');
} catch (err) {
  logger.error(`Migration failed: ${err.message}`);
  process.exit(1);
} finally {
  closeDatabase();
}
