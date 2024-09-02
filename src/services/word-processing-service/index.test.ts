import WordProcessingService from './index';
import fs from 'fs';
import path from 'path';

jest.setTimeout(120000); // Increase timeout to 2 minutes due to API calls

const readTestInput = (filename: string): any => {
  const filePath = path.join(__dirname, 'test-inputs', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

describe('WordProcessingService with actual API calls', () => {
  beforeEach(() => {
    (WordProcessingService as any).wordDictionary = {}; // Reset the dictionary before each test
  });

  it('should process synchronous keywords and add to dictionary', async () => {
    const syncData = readTestInput('sync-keywords.json');
    const documentId = syncData.id;
    const keywords = syncData.keyword_extraction.keywords;

    console.log('Processing synchronous keywords:', JSON.stringify(keywords));
    console.log('Document ID:', documentId);

    await WordProcessingService.processKeywords(keywords, documentId);
    const dictionary = WordProcessingService.getWordDictionary();

    console.log('Resulting dictionary:', JSON.stringify(dictionary, null, 2));

    expect(Object.keys(dictionary).length).toBeGreaterThan(0);
    for (const keyword of keywords) {
      if (dictionary[keyword]) {
        expect(dictionary[keyword].dataIds).toContain(documentId);
        expect(dictionary[keyword].definitions.length).toBeGreaterThan(0);
        expect(typeof dictionary[keyword].definitions[0].text).toBe('string');
        console.log(`Definition for "${keyword}":`, dictionary[keyword].definitions[0].text);
      } else {
        console.log(`No definition found for "${keyword}"`);
      }
    }
  });

  it('should process asynchronous keywords and add to dictionary', async () => {
    const asyncData = readTestInput('async-keywords.json');
    const documentId = asyncData.processed_data.id;
    const keywords = asyncData.processed_data.keyword_extraction.keywords;

    console.log('Processing asynchronous keywords:', JSON.stringify(keywords));
    console.log('Document ID:', documentId);

    await WordProcessingService.processKeywords(keywords, documentId);
    const dictionary = WordProcessingService.getWordDictionary();

    console.log('Resulting dictionary:', JSON.stringify(dictionary, null, 2));

    expect(Object.keys(dictionary).length).toBeGreaterThan(0);
    for (const keyword of keywords) {
      if (dictionary[keyword]) {
        expect(dictionary[keyword].dataIds).toContain(documentId);
        expect(dictionary[keyword].definitions.length).toBeGreaterThan(0);
        expect(typeof dictionary[keyword].definitions[0].text).toBe('string');
        console.log(`Definition for "${keyword}":`, dictionary[keyword].definitions[0].text);
      } else {
        console.log(`No definition found for "${keyword}"`);
      }
    }
  });

  it('should handle words not found in API', async () => {
    const keywords = ['asdfghjkl'];
    const documentId = 'test_doc';
  
    console.log('Processing keywords with word likely not found in API:', keywords);
    await WordProcessingService.processKeywords(keywords, documentId);
    const dictionary = WordProcessingService.getWordDictionary();
  
    console.log('Resulting dictionary:', JSON.stringify(dictionary, null, 2));
    expect(dictionary).toHaveProperty('asdfghjkl');
    expect(dictionary['asdfghjkl'].definitions[0].text).toBeNull();
  });

  it('should handle rate limiting from the API', async () => {
    const syncData = readTestInput('sync-keywords.json');
    const asyncData = readTestInput('async-keywords.json');
    const keywords = [
      ...syncData.keyword_extraction.keywords,
      ...asyncData.processed_data.keyword_extraction.keywords
    ];
    const documentId = 'rate_limit_test';

    console.log('Processing a large number of keywords to test rate limiting:', keywords);
    await WordProcessingService.processKeywords(keywords, documentId);
    const dictionary = WordProcessingService.getWordDictionary();

    console.log('Resulting dictionary:', JSON.stringify(dictionary, null, 2));
    expect(Object.keys(dictionary).length).toBeGreaterThan(0);

    for (const keyword of keywords) {
      if (dictionary[keyword]) {
        console.log(`Definition for "${keyword}":`, dictionary[keyword].definitions[0].text);
      } else {
        console.log(`No definition found for "${keyword}"`);
      }
    }
  });
});