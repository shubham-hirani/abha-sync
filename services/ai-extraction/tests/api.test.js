const request = require('supertest');
const app = require('../src/index');

describe('AI Extraction API', () => {
  test('GET /health should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('ai-extraction');
  });

  test('POST /extract should extract data from valid text', async () => {
    const res = await request(app)
      .post('/extract')
      .send({ text: 'Patient: Mr. Rohan. Dr. Mehta. Diagnosis: Diabetes. Prescribed metformin 500mg.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('patient');
    expect(res.body.data).toHaveProperty('doctor');
    expect(res.body.data).toHaveProperty('diagnosis');
    expect(res.body.data).toHaveProperty('medicines');
    expect(res.body.data).toHaveProperty('confidenceScore');
  });

  test('POST /extract should reject empty text', async () => {
    const res = await request(app)
      .post('/extract')
      .send({ text: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /extract should reject missing text field', async () => {
    const res = await request(app)
      .post('/extract')
      .send({});

    expect(res.status).toBe(400);
  });

  test('POST /extract should reject short text', async () => {
    const res = await request(app)
      .post('/extract')
      .send({ text: 'short' });

    expect(res.status).toBe(400);
  });
});
