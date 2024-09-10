// src/services/auth-service/auth.test.ts

import request from 'supertest';
import { app } from './index';
import axios from 'axios';
import * as authMiddleware from './authMiddleware';
import { userNodeService } from '../user-node-service/user.service';
import { UserNodePrivate } from '../user-node-service/user.model';

jest.mock('axios');
jest.mock('./authMiddleware');
jest.mock('../user-node-service/user.service');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedAuthMiddleware = authMiddleware as jest.Mocked<typeof authMiddleware>;
const mockedUserNodeService = userNodeService as jest.Mocked<typeof userNodeService>;

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('should register a new user and create a user node', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { _id: 'user123' } });
    mockedUserNodeService.createUserNode.mockResolvedValueOnce({
      id: 'user123',
      username: 'Test User',
      email: 'test@example.com',
      verificationStatus: 'unverified',
      createdAt: new Date(),
      lastActive: new Date(),
      nodeCreations: {},
      nodeInteractions: {},
      preferences: {}
    } as UserNodePrivate);
    
    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password123', name: 'Test User' });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'User registered successfully');
    expect(response.body).toHaveProperty('userId', 'user123');
    expect(mockedUserNodeService.createUserNode).toHaveBeenCalledWith({
      id: 'user123',
      username: 'Test User',
      email: 'test@example.com',
      verificationStatus: 'unverified',
      createdAt: expect.any(Date),
      lastActive: expect.any(Date),
      nodeCreations: {},
      nodeInteractions: {},
      preferences: {}
    });
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

  it('should get user profile with combined Auth0 and Neo4j data', async () => {
    (mockedAuthMiddleware.jwtCheck as jest.Mock).mockImplementation((req, res, next) => {
      req.auth = { sub: 'user123' };
      next();
    });

    mockedAxios.get.mockResolvedValueOnce({ 
      data: { sub: 'user123', name: 'Test User', email: 'test@example.com' } 
    });

    mockedUserNodeService.getUserNodePrivate.mockResolvedValueOnce({
      id: 'user123',
      username: 'Test User',
      email: 'test@example.com',
      verificationStatus: 'verified',
      createdAt: new Date(),
      lastActive: new Date(),
      nodeCreations: { beliefnode: ['node1', 'node2'] },
      nodeInteractions: { wordnode: ['node3'] },
      preferences: {}
    } as UserNodePrivate);
    
    const response = await request(app)
      .get('/auth/user-profile')
      .set('Authorization', 'Bearer valid.jwt.token');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('sub', 'user123');
    expect(response.body).toHaveProperty('name', 'Test User');
    expect(response.body).toHaveProperty('email', 'test@example.com');
    expect(response.body).toHaveProperty('verificationStatus', 'verified');
    expect(response.body).toHaveProperty('nodeCreations');
    expect(response.body).toHaveProperty('nodeInteractions');
    expect(mockedUserNodeService.getUserNodePrivate).toHaveBeenCalledWith('user123');
  });
  
  it('should handle logout', async () => {
    const response = await request(app).post('/auth/logout');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Logout successful. Remember to clear the token on the client side.');
  });

  it('should handle registration failure', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Registration failed'));

    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password123', name: 'Test User' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Registration failed');
  });

  it('should handle user profile retrieval failure', async () => {
    (mockedAuthMiddleware.jwtCheck as jest.Mock).mockImplementation((req, res, next) => {
      req.auth = { sub: 'user123' };
      next();
    });

    mockedAxios.get.mockRejectedValueOnce(new Error('Failed to get user info'));

    const response = await request(app)
      .get('/auth/user-profile')
      .set('Authorization', 'Bearer valid.jwt.token');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Failed to get user profile');
  });
});
