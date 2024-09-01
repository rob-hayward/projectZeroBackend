import WordProcessingService from './index';
import axios from 'axios';

// Remove the axios mock
jest.unmock('axios');

describe('WordProcessingService with real API calls', () => {
  beforeEach(() => {
    (WordProcessingService as any).wordDictionary = {}; // Reset the dictionary before each test
  });

  it('should process keywords and add to dictionary', async () => {
    const keywords = ['hello', 'world'];
    const documentId = 'doc1';
    console.log('Processing keywords:', JSON.stringify(keywords));
    console.log('Document ID:', documentId);

    await WordProcessingService.processKeywords(keywords, documentId);
    const dictionary = WordProcessingService.getWordDictionary();

    console.log('Resulting dictionary:', JSON.stringify(dictionary, null, 2));
    expect(dictionary).toHaveProperty('hello');
    expect(dictionary).toHaveProperty('world');
    expect(dictionary.hello.definitions[0].text).toBeTruthy();
    expect(dictionary.world.definitions[0].text).toBeTruthy();
    expect(dictionary.hello.dataIds).toContain(documentId);
    expect(dictionary.world.dataIds).toContain(documentId);
  }, 10000); // Increase timeout for API calls

  it('should handle existing words', async () => {
    console.log('Processing keywords for first document');
    await WordProcessingService.processKeywords(['typescript'], 'doc1');
    console.log('Processing keywords for second document');
    await WordProcessingService.processKeywords(['typescript'], 'doc2');

    const dictionary = WordProcessingService.getWordDictionary();
    console.log('Resulting dictionary:', JSON.stringify(dictionary, null, 2));

    expect(dictionary.typescript.dataIds).toContain('doc1');
    expect(dictionary.typescript.dataIds).toContain('doc2');
    expect(dictionary.typescript.definitions.length).toBe(1);
  }, 10000);

  it('should handle words not found in API', async () => {
    console.log('Processing keywords with word likely not found in API');
    await WordProcessingService.processKeywords(['asdfghjkl'], 'doc1');
    const dictionary = WordProcessingService.getWordDictionary();

    console.log('Resulting dictionary:', JSON.stringify(dictionary, null, 2));
    expect(dictionary).not.toHaveProperty('asdfghjkl');
  }, 10000);
});