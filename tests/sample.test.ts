import request from 'supertest';
import app from '../src/app';

describe('Sample API Endpoints', () => {
  it('GET /api/v1/sample', async () => {
    const res = await request(app).get('/api/v1/sample');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
  });

  it('POST /api/v1/sample', async () => {
    const res = await request(app)
      .post('/api/v1/sample')
      .send({ name: 'test' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
  });
});
