const request = require('supertest');
const app = require('../src/index');

describe('FHIR Generator API', () => {
  test('GET /health should return healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('fhir-generator');
  });

  test('POST /generate should generate FHIR bundle', async () => {
    const res = await request(app)
      .post('/generate')
      .send({
        patient: { name: 'Rohan V.' },
        doctor: { name: 'Dr. Mehta' },
        diagnosis: 'Diabetes',
        medicines: [{ name: 'Metformin', dosage: '500mg' }],
        labValues: [{ parameter: 'HbA1c', value: 8.5, unit: '%' }],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bundle.resourceType).toBe('Bundle');
    expect(res.body.data.validation.valid).toBe(true);
  });

  test('POST /generate should reject missing patient', async () => {
    const res = await request(app)
      .post('/generate')
      .send({ diagnosis: 'Diabetes' });

    expect(res.status).toBe(400);
  });

  test('POST /generate should handle minimal input', async () => {
    const res = await request(app)
      .post('/generate')
      .send({ patient: { name: 'Test Patient' } });

    expect(res.status).toBe(200);
    expect(res.body.data.bundle.entry.length).toBeGreaterThan(0);
  });
});
