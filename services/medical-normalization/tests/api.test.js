const request = require('supertest');
const app = require('../src/index');

describe('Medical Normalization API', () => {
  test('GET /health should return healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('medical-normalization');
  });

  test('POST /normalize should normalize diagnosis and medicines', async () => {
    const res = await request(app)
      .post('/normalize')
      .send({
        diagnosis: 'Type 2 Diabetes',
        medicines: [
          { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
          { name: 'Atorvastatin', dosage: '10mg' },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.diagnosis.icdCode).toBe('E11');
    expect(res.body.data.medicines).toHaveLength(2);
    expect(res.body.data.medicines[0].genericName).toBe('Metformin');
  });

  test('POST /normalize should reject missing diagnosis', async () => {
    const res = await request(app)
      .post('/normalize')
      .send({});

    expect(res.status).toBe(400);
  });

  test('POST /normalize should handle diagnosis without medicines', async () => {
    const res = await request(app)
      .post('/normalize')
      .send({ diagnosis: 'Hypertension' });

    expect(res.status).toBe(200);
    expect(res.body.data.diagnosis.icdCode).toBe('I10');
    expect(res.body.data.medicines).toHaveLength(0);
  });
});
