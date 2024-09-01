import axios from 'axios';
import nock from 'nock';
import { testConnection, processText, processTextAsync, getResult } from './projectZeroAIClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('projectZeroAIClient', () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  it('should test connection successfully', async () => {
    const mockResponse = { message: 'Connected successfully' };
    mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });
    
    const result = await testConnection();
    
    console.log('testConnection response:', JSON.stringify(result, null, 2));
    expect(result).toEqual(mockResponse);
  });

  it('should process text successfully', async () => {
    const mockResponse = { id: '123', keyword_extraction: { keywords: ['test'] } };
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });
    
    const testContent = 'Test content';
    console.log('processText input:', testContent);
    
    const result = await processText(testContent);
    
    console.log('processText response:', JSON.stringify(result, null, 2));
    expect(result).toEqual(mockResponse);
  });

  it('should process text asynchronously', async () => {
    const mockResponse = { task_id: '123', status: 'processing' };
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });
    
    const testContent = 'Test content';
    console.log('processTextAsync input:', testContent);
    
    const result = await processTextAsync(testContent);
    
    console.log('processTextAsync response:', JSON.stringify(result, null, 2));
    expect(result).toEqual(mockResponse);
  });

  it('should get result successfully', async () => {
    const mockResponse = { status: 'completed', processed_data: { id: '123', keyword_extraction: { keywords: ['test'] } } };
    mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });
    
    const taskId = '123';
    console.log('getResult input taskId:', taskId);
    
    const result = await getResult(taskId);
    
    console.log('getResult response:', JSON.stringify(result, null, 2));
    expect(result).toEqual(mockResponse);
  });
});