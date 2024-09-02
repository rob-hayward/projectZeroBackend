import { testConnection, processText, processTextAsync, getResult } from './projectZeroAIClient';
import fs from 'fs';
import path from 'path';

const readTestInput = (filename: string): string => {
  return fs.readFileSync(path.join(__dirname, 'test-inputs', filename), 'utf-8');
};

const logFile = path.join(__dirname, 'integration_test_log.txt');

// Helper function to log responses
const logResponse = (testName: string, response: any) => {
  const logMessage = `\n--- ${testName} Response ---\n${JSON.stringify(response, null, 2)}\n-------------------------\n`;
  
  // Log to file
  fs.appendFileSync(logFile, logMessage);
  
  // Log to console
  console.log(logMessage);
};

describe('ProjectZeroAI Client Integration Tests with Logging', () => {
  beforeAll(() => {
    // Clear the log file before running tests
    fs.writeFileSync(logFile, '');
    console.log('Integration tests starting. Logs will be saved to:', logFile);
  });

  afterAll(() => {
    console.log('Integration tests completed. Logs have been saved to:', logFile);
  });

  jest.setTimeout(30000); // Increase timeout for API calls

  it('should connect to the FastAPI server', async () => {
    const result = await testConnection();
    logResponse('Test Connection', result);
    expect(result).toHaveProperty('message');
    expect(result.message).toContain('Welcome');
  });

  it('should process text synchronously', async () => {
    const testContent = readTestInput('test_input_1.txt');
    const result = await processText(testContent);
    logResponse('Process Text Synchronously', result);
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('keyword_extraction');
    expect(result.keyword_extraction).toHaveProperty('keywords');
    expect(Array.isArray(result.keyword_extraction.keywords)).toBeTruthy();
  });

  it('should process text asynchronously and get results', async () => {
    const testContent = readTestInput('test_input_2.txt');
    const asyncResult = await processTextAsync(testContent);
    logResponse('Process Text Asynchronously (Initial)', asyncResult);
    expect(asyncResult).toHaveProperty('task_id');
    expect(asyncResult).toHaveProperty('status');
    expect(asyncResult.status).toBe('processing');

    // Wait for processing to complete
    let finalResult;
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      finalResult = await getResult(asyncResult.task_id);
      if (finalResult.status === 'completed') break;
    }

    logResponse('Process Text Asynchronously (Final)', finalResult);
    expect(finalResult).toHaveProperty('status');
    expect(finalResult.status).toBe('completed');
    expect(finalResult).toHaveProperty('processed_data');
    expect(finalResult.processed_data).toHaveProperty('keyword_extraction');
    expect(Array.isArray(finalResult.processed_data.keyword_extraction.keywords)).toBeTruthy();
  });
});