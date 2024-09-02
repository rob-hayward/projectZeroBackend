import axios from 'axios';
import { WordDictionary, Definition } from './types';

class WordProcessingService {
  private wordDictionary: WordDictionary = {};
  private retryDelay = 1000; // 1 second
  private maxRetries = 3;

  async processKeywords(keywords: string[], documentId: string): Promise<void> {
    for (const keyword of keywords) {
      if (this.wordDictionary[keyword]) {
        console.log(`Word "${keyword}" already exists in dictionary. Adding document ID.`);
        if (!this.wordDictionary[keyword].dataIds.includes(documentId)) {
          this.wordDictionary[keyword].dataIds.push(documentId);
        }
      } else {
        console.log(`Fetching definition for word: "${keyword}"`);
        const definition = await this.fetchDefinitionWithRetry(keyword);
        this.wordDictionary[keyword] = {
          definitions: [{ text: definition, votes: 0 }],
          dataIds: [documentId]
        };
        if (definition) {
          console.log(`Definition found for "${keyword}": ${definition}`);
        } else {
          console.log(`No definition found for "${keyword}"`);
        }
      }
      // Add a small delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async fetchDefinitionWithRetry(word: string, retries = 0): Promise<string | null> {
    try {
      const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (response.data && response.data[0] && response.data[0].meanings && response.data[0].meanings[0] && response.data[0].meanings[0].definitions) {
        return response.data[0].meanings[0].definitions[0].definition;
      }
      return null;
    } catch (error: any) {
      if (error.response && error.response.status === 429 && retries < this.maxRetries) {
        const delay = Math.pow(2, retries) * this.retryDelay;
        console.log(`Rate limited for "${word}". Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchDefinitionWithRetry(word, retries + 1);
      }
      if (error.response && error.response.status === 404) {
        return null; // Word not found in the dictionary
      }
      console.error(`Error fetching definition for ${word}:`, error.message);
      return null;
    }
  }

  getWordDictionary(): WordDictionary {
    return this.wordDictionary;
  }
}

export default new WordProcessingService();