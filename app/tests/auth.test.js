const request = require('supertest');
const app = require('../server');
const { reset } = require('../database/db');

// 每个测试前重置数据
beforeEach(() => {
  reset();
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser1',
          email: 'test1@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe('testuser1');
      expect(res.body.data.user.email).toBe('test1@example.com');
      expect(res.body.data.user).not.toHaveProperty('password');
      expect(res.body.data.user).not.toHaveProperty('password_hash');
    });

    it('should return 400 if username is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'shortpass',
          email: 'short@example.com',
          password: '12345'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 409 if username already exists', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicateuser',
          email: 'dup1@example.com',
          password: 'password123'
        });
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicateuser',
          email: 'dup2@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 409 if email already exists', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'emailuser1',
          email: 'same@example.com',
          password: 'password123'
        });
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'emailuser2',
          email: 'same@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials and return token', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'loginuser',
          email: 'login@example.com',
          password: 'password123'
        });
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.username).toBe('loginuser');
    });

    it('should return 401 with wrong password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'loginuser2',
          email: 'login2@example.com',
          password: 'password123'
        });
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser2',
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 with non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info with valid token', async () => {
      const loginRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'meuser',
          email: 'me@example.com',
          password: 'password123'
        });
      
      const token = loginRes.body.data.token;
      
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer ' + token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('meuser');
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});