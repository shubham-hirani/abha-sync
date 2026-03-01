/**
 * Lightweight HTTP client for inter-service communication
 * Uses native Node.js fetch (available in Node 18+)
 */

const { logger, AppError } = require('@abha-sync/shared');

const SERVICE_URLS = {
  extraction: process.env.AI_EXTRACTION_URL || 'http://localhost:3001',
  normalization: process.env.NORMALIZATION_URL || 'http://localhost:3002',
  fhir: process.env.FHIR_GENERATOR_URL || 'http://localhost:3003',
  abha: process.env.ABHA_MOCK_URL || 'http://localhost:3004',
};

async function callService(serviceName, path, data, method = 'POST') {
  const baseUrl = SERVICE_URLS[serviceName];
  if (!baseUrl) {
    throw new AppError(`Unknown service: ${serviceName}`, 500);
  }

  const url = `${baseUrl}${path}`;
  logger.info(`Calling ${serviceName} service: ${method} ${url}`);

  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseData = await response.json();

    if (!response.ok) {
      throw new AppError(
        responseData.error?.message || `Service ${serviceName} returned ${response.status}`,
        response.status
      );
    }

    logger.info(`${serviceName} response: success=${responseData.success}`);
    return responseData;
  } catch (err) {
    if (err instanceof AppError) throw err;

    logger.error(`Failed to call ${serviceName}: ${err.message}`);
    throw new AppError(`Service ${serviceName} unavailable: ${err.message}`, 503);
  }
}

module.exports = { callService, SERVICE_URLS };
