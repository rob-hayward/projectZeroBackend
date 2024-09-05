// src/services/auth-service/auth.test.ts

import request from 'supertest';
import { app, server } from './index';
import axios from 'axios';
import * as authMiddleware from './authMiddleware';

jest.mock('axios');
jest.mock('./authMiddleware');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedAuthMiddleware = authMiddleware as jest.Mocked<typeof authMiddleware>;

describe('Auth Service', () => {
  beforeAll((done) => {
    server.listen(0, () => {
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should have a health check endpoint', async () => {
    const response = await request(app).get('/auth/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'Auth Service is healthy');
  });

  it('should return 401 for protected routes without a token', async () => {
    const response = await request(app).get('/auth/api/authorized');
    expect(response.status).toBe(401);
  });

  it('should register a new user', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { _id: 'user123' } });
    
    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password123', name: 'Test User' });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'User registered successfully');
    expect(response.body).toHaveProperty('userId', 'user123');
  });

  it('should login a user', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { access_token: 'token123', refresh_token: 'refresh123' } });
    
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('access_token', 'token123');
    expect(response.body).toHaveProperty('refresh_token', 'refresh123');
  });

  it('should refresh a token', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { access_token: 'newtoken123' } });
    
    const response = await request(app)
      .post('/auth/refresh-token')
      .send({ refresh_token: 'refresh123' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('access_token', 'newtoken123');
  });

  it('should get user profile', async () => {
    (mockedAuthMiddleware.jwtCheck as jest.Mock).mockImplementation((req, res, next) => {
      req.auth = { sub: 'user123' };
      next();
    });

    mockedAxios.get.mockResolvedValueOnce({ data: { sub: 'user123', name: 'Test User' } });
    
    const response = await request(app)
      .get('/auth/user-profile')
      .set('Authorization', 'Bearer valid.jwt.token');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('sub', 'user123');
    expect(response.body).toHaveProperty('name', 'Test User');
  });
  
  it('should handle logout', async () => {
    const response = await request(app).post('/auth/logout');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Logout successful. Remember to clear the token on the client side.');
  });
});