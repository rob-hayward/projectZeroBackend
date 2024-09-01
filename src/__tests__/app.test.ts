import request from 'supertest';
import { app, server } from '../index';
import nock from 'nock';
import * as projectZeroAIClient from '../services/projectZeroAIClient/projectZeroAIClient';

jest.mock('../services/projectZeroAIClient/projectZeroAIClient');

beforeAll(() => {
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
});

afterAll(done => {
  server.close(done);
  nock.cleanAll();
  nock.enableNetConnect();
});

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / should return welcome message', async () => {
    const res = await request(app).get('/');
    console.log('Response from GET /:', JSON.stringify(res.body, null, 2));
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Welcome to project-zero-backend!');
  });

  it('GET /test-fastapi should connect to FastAPI service', async () => {
    (projectZeroAIClient.testConnection as jest.Mock).mockResolvedValueOnce({ message: 'Connected to FastAPI' });
    const res = await request(app).get('/test-fastapi');
    console.log('Response from GET /test-fastapi:', JSON.stringify(res.body, null, 2));
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Connected to FastAPI');
  });

  it('POST /process should process text', async () => {
    const mockResult = { 
      id: '123', 
      keyword_extraction: { 
        keywords: ['test', 'keyword'] 
      } 
    };
    (projectZeroAIClient.processText as jest.Mock).mockResolvedValueOnce(mockResult);
    
    const testInput = { content: 'Test content' };
    console.log('Sending to POST /process:', JSON.stringify(testInput, null, 2));
    
    const res = await request(app)
      .post('/process')
      .send(testInput);
    
    console.log('Response from POST /process:', JSON.stringify(res.body, null, 2));
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockResult);
  });

  it('POST /process-async should start async processing', async () => {
    const mockResult = { task_id: '123', status: 'processing' };
    (projectZeroAIClient.processTextAsync as jest.Mock).mockResolvedValueOnce(mockResult);
    
    const testInput = { content: 'Test content for async processing' };
    console.log('Sending to POST /process-async:', JSON.stringify(testInput, null, 2));
    
    const res = await request(app)
      .post('/process-async')
      .send(testInput);
    
    console.log('Response from POST /process-async:', JSON.stringify(res.body, null, 2));
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockResult);
  });

  it('GET /result/:taskId should return result', async () => {
    const mockResult = { 
      status: 'completed', 
      processed_data: { 
        id: '123', 
        keyword_extraction: { 
          keywords: ['test', 'keyword'] 
        } 
      } 
    };
    (projectZeroAIClient.getResult as jest.Mock).mockResolvedValueOnce(mockResult);
    
    const taskId = '123';
    console.log(`Sending GET /result/${taskId}`);
    
    const res = await request(app).get(`/result/${taskId}`);
    
    console.log(`Response from GET /result/${taskId}:`, JSON.stringify(res.body, null, 2));
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockResult);
  });
});