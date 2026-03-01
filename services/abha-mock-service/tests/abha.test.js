const request = require('supertest');
const app = require('../src/index');

// Set test environment
process.env.NODE_ENV = 'test';

describe('ABHA Mock Service', () => {
  describe('Health Check', () => {
    test('GET /health should return healthy', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('abha-mock-service');
    });
  });

  describe('POST /mock-abha/upload', () => {
    const validPayload = {
      fhirBundle: {
        resourceType: 'Bundle',
        type: 'transaction',
        entry: [{ resource: { resourceType: 'Patient' } }],
      },
      consents: {
        shareWithDoctor: true,
        shareWithInsurance: false,
        shareWithGovernment: true,
        researchUse: false,
      },
      patientAbhaId: 'ABHA123456789',
    };

    test('should accept valid upload with consent', async () => {
      const res = await request(app)
        .post('/mock-abha/upload')
        .send(validPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACCEPTED');
      expect(res.body.data.transactionId).toBeDefined();
      expect(res.body.data.responseToken).toBeDefined();
    });

    test('should reject upload without FHIR bundle', async () => {
      const res = await request(app)
        .post('/mock-abha/upload')
        .send({
          consents: validPayload.consents,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject upload without consent', async () => {
      const res = await request(app)
        .post('/mock-abha/upload')
        .send({
          fhirBundle: validPayload.fhirBundle,
        });

      expect(res.status).toBe(400);
    });

    test('should reject upload with no valid consent flags', async () => {
      const res = await request(app)
        .post('/mock-abha/upload')
        .send({
          fhirBundle: validPayload.fhirBundle,
          consents: {
            shareWithDoctor: false,
            shareWithInsurance: false,
            shareWithGovernment: false,
            researchUse: false,
          },
        });

      expect(res.status).toBe(403);
    });

    test('should record consent flags in response', async () => {
      const res = await request(app)
        .post('/mock-abha/upload')
        .send(validPayload);

      expect(res.body.data.consentsRecorded.shareWithDoctor).toBe(true);
      expect(res.body.data.consentsRecorded.shareWithGovernment).toBe(true);
    });
  });

  describe('GET /mock-abha/status/:transactionId', () => {
    test('should return transaction status', async () => {
      const res = await request(app)
        .get('/mock-abha/status/ABHA-TXN-123');

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');
    });
  });

  describe('POST /mock-abha/verify', () => {
    test('should verify valid ABHA ID', async () => {
      const res = await request(app)
        .post('/mock-abha/verify')
        .send({ abhaId: 'ABHA123456789' });

      expect(res.status).toBe(200);
      expect(res.body.data.verified).toBe(true);
    });

    test('should reject invalid ABHA ID', async () => {
      const res = await request(app)
        .post('/mock-abha/verify')
        .send({ abhaId: 'INVALID' });

      expect(res.status).toBe(200);
      expect(res.body.data.verified).toBe(false);
    });

    test('should reject missing ABHA ID', async () => {
      const res = await request(app)
        .post('/mock-abha/verify')
        .send({});

      expect(res.status).toBe(400);
    });
  });
});
