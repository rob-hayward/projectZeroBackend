import axios from 'axios';
import { WordDictionary, Definition } from './types';

class WordProcessingService {
  private wordDictionary: WordDictionary = {};

  async processKeywords(keywords: string[], documentId: string): Promise<void> {
    for (const keyword of keywords) {
      if (this.wordDictionary[keyword]) {
        console.log(`Word "${keyword}" already exists in dictionary. Adding document ID.`);
        if (!this.wordDictionary[keyword].dataIds.includes(documentId)) {
          this.wordDictionary[keyword].dataIds.push(documentId);
        }
      } else {
        console.log(`Fetching definition for word: "${keyword}"`);
        const definition = await this.fetchDefinition(keyword);
        if (definition) {
          console.log(`Definition found for "${keyword}": ${definition}`);
          this.wordDictionary[keyword] = {
            definitions: [{ text: definition, votes: 0 }],
            dataIds: [documentId]
          };
        } else {
          console.log(`No definition found for "${keyword}"`);
        }
      }
    }
  }

  private async fetchDefinition(word: string): Promise<string | null> {
    try {
      const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (response.data && response.data[0] && response.data[0].meanings && response.data[0].meanings[0] && response.data[0].meanings[0].definitions) {
        return response.data[0].meanings[0].definitions[0].definition;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching definition for ${word}:`, error);
      return null;
    }
  }

  getWordDictionary(): WordDictionary {
    return this.wordDictionary;
  }
}

export default new WordProcessingService();