import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { testConnection, processText, processTextAsync, getResult } from './projectZeroAIClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const readTestInput = (filename: string): string => {
  return fs.readFileSync(path.join(__dirname, 'test-inputs', filename), 'utf-8');
};

describe('projectZeroAIClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should test connection successfully', async () => {
    const mockResponse = { message: 'Connected successfully' };
    mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });
    
    const result = await testConnection();
    
    expect(result).toEqual(mockResponse);
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:5001/');
  });

  it('should process text successfully', async () => {
    const mockResponse = { id: '123', keyword_extraction: { keywords: ['AI', 'machine learning', 'natural language processing'] } };
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });
    
    const testContent = readTestInput('test_input_1.txt');
    const result = await processText(testContent);
    
    expect(result).toEqual(mockResponse);
    expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:5001/process_text', {
      id: expect.any(String),
      data: testContent
    });
  });

  it('should process text asynchronously', async () => {
    const mockResponse = { task_id: '456', status: 'processing' };
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });
    
    const testContent = readTestInput('test_input_2.txt');
    const result = await processTextAsync(testContent);
    
    expect(result).toEqual(mockResponse);
    expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:5001/process_text_async', {
      id: expect.any(String),
      data: testContent
    });
  });

  it('should get result successfully', async () => {
    const mockResponse = { 
      status: 'completed', 
      processed_data: { 
        id: '456', 
        keyword_extraction: { 
          keywords: ['big data', 'neural networks', 'deep learning'] 
        } 
      } 
    };
    mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });
    
    const taskId = '456';
    const result = await getResult(taskId);
    
    expect(result).toEqual(mockResponse);
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:5001/get_result/456');
  });
});