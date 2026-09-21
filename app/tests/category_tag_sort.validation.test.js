const request = require('supertest');
const app = require('../server');
const { reset } = require('../database/db');

beforeEach(() => { reset(); });

async function registerAndLogin(name) {
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ username: name, email: `${name}@example.com`, password: 'password123' });
  return reg.body.data.token;
}

describe('Category list sort whitelist', () => {
  test('rejects unknown sort_by (e.g. __proto__)', async () => {
    const token = await registerAndLogin('catsort');
    const res = await request(app)
      .get('/api/categories?sort_by=__proto__').set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects invalid sort_order', async () => {
    const token = await registerAndLogin('catsort2');
    const res = await request(app)
      .get('/api/categories?sort_order=sideways').set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('sorts by name asc and desc', async () => {
    const token = await registerAndLogin('catsort3');
    for (const name of ['beta', 'alpha', 'charlie']) {
      await request(app)
        .post('/api/categories').set('Authorization', 'Bearer ' + token)
        .send({ name });
    }
    const asc = await request(app)
      .get('/api/categories?sort_by=name&sort_order=asc').set('Authorization', 'Bearer ' + token);
    expect(asc.body.data.map(c => c.name)).toEqual(['alpha', 'beta', 'charlie']);
    const desc = await request(app)
      .get('/api/categories?sort_by=name&sort_order=desc').set('Authorization', 'Bearer ' + token);
    expect(desc.body.data.map(c => c.name)).toEqual(['charlie', 'beta', 'alpha']);
  });
});

describe('Tag list sort whitelist', () => {
  test('rejects unknown sort_by (e.g. __proto__)', async () => {
    const token = await registerAndLogin('tagsort');
    const res = await request(app)
      .get('/api/tags?sort_by=__proto__').set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects invalid sort_order', async () => {
    const token = await registerAndLogin('tagsort2');
    const res = await request(app)
      .get('/api/tags?sort_order=upwards').set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('sorts by name asc', async () => {
    const token = await registerAndLogin('tagsort3');
    for (const name of ['delta', 'charlie']) {
      await request(app)
        .post('/api/tags').set('Authorization', 'Bearer ' + token)
        .send({ name });
    }
    const res = await request(app)
      .get('/api/tags?sort_by=name&sort_order=asc').set('Authorization', 'Bearer ' + token);
    expect(res.body.data.map(t => t.name)).toEqual(['charlie', 'delta']);
  });
});