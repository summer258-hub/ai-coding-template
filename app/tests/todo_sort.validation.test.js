const request = require('supertest');
const app = require('../server');
const { reset } = require('../database/db');

beforeEach(() => { reset(); });

async function registerAndLogin() {
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ username: 'sortuser', email: 'sort@example.com', password: 'password123' });
  return reg.body.data.token;
}

describe('Todo list sort whitelist', () => {
  test('accepts valid sort_by=priority & sort_order=asc', async () => {
    const token = await registerAndLogin();
    await request(app)
      .post('/api/todos').set('Authorization', 'Bearer ' + token)
      .send({ title: 'buy milk', priority: 'high' });
    const res = await request(app)
      .get('/api/todos?sort_by=priority&sort_order=asc').set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('rejects invalid sort_order', async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .get('/api/todos?sort_order=sideways').set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects unknown sort_by (e.g. __proto__)', async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .get('/api/todos?sort_by=__proto__').set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
