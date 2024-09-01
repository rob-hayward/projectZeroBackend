import request from 'supertest';
import { app, server } from '../index';

afterAll(done => {
  server.close(done);
});

describe('API Endpoints', () => {
  it('GET / should return welcome message', async () => {
    const res = await request(app).get('/');
    console.log('Response from GET /:', JSON.stringify(res.body, null, 2));
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Welcome to project-zero-backend!');
  });

  it('GET /test-fastapi should connect to FastAPI service', async () => {
    const res = await request(app).get('/test-fastapi');
    console.log('Response from GET /test-fastapi:', JSON.stringify(res.body, null, 2));
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  }, 10000);

  it('POST /process should process text and return correct data structure', async () => {
    const testInput = {
      content: "Artificial Intelligence and Machine Learning are transforming technology. Natural Language Processing is a key area of AI research."
    };
    console.log('Sending to POST /process:', JSON.stringify(testInput, null, 2));

    const res = await request(app)
      .post('/process')
      .send(testInput);

    console.log('Response from POST /process:', JSON.stringify(res.body, null, 2));

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(typeof res.body.id).toBe('string');
    expect(res.body).toHaveProperty('keyword_extraction');
    expect(res.body.keyword_extraction).toHaveProperty('keywords');
    expect(Array.isArray(res.body.keyword_extraction.keywords)).toBe(true);
    expect(res.body.keyword_extraction.keywords.length).toBeGreaterThan(0);
    const firstKeyword = res.body.keyword_extraction.keywords[0];
    expect(typeof firstKeyword).toBe('string');
  }, 15000);

  it('POST /process-async should start async processing', async () => {
    const testInput = {
      content: "This is a test for asynchronous processing of text data using AI techniques."
    };
    console.log('Sending to POST /process-async:', JSON.stringify(testInput, null, 2));

    const res = await request(app)
      .post('/process-async')
      .send(testInput);

    console.log('Response from POST /process-async:', JSON.stringify(res.body, null, 2));

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('task_id');
    expect(typeof res.body.task_id).toBe('string');
    expect(res.body).toHaveProperty('status', 'processing');
    expect(res.body).toHaveProperty('message');
  }, 10000);

  it('GET /result/:taskId should return correct result structure', async () => {
    const startRes = await request(app)
      .post('/process-async')
      .send({ content: "Test content for async processing" });

    console.log('Response from starting async process:', JSON.stringify(startRes.body, null, 2));

    expect(startRes.statusCode).toBe(200);
    const taskId = startRes.body.task_id;

    const maxAttempts = 5;
    let attempts = 0;
    let resultRes;

    while (attempts < maxAttempts) {
      resultRes = await request(app).get(`/result/${taskId}`);
      console.log(`Attempt ${attempts + 1} - Response from GET /result/${taskId}:`, JSON.stringify(resultRes.body, null, 2));
      
      if (resultRes.body.status === 'completed') break;
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    expect(resultRes).toBeDefined();
    
    if (resultRes) {
      expect(resultRes.statusCode).toBe(200);
      expect(resultRes.body).toHaveProperty('status');
      
      if (resultRes.body.status === 'completed') {
        expect(resultRes.body).toHaveProperty('processed_data');
        expect(resultRes.body.processed_data).toHaveProperty('id');
        expect(resultRes.body.processed_data).toHaveProperty('keyword_extraction');
        expect(resultRes.body.processed_data.keyword_extraction).toHaveProperty('keywords');
        expect(Array.isArray(resultRes.body.processed_data.keyword_extraction.keywords)).toBe(true);
      } else {
        expect(resultRes.body.status).toBe('processing');
      }
    } else {
      console.log('No response received from /result endpoint');
    }
  }, 30000);
});
