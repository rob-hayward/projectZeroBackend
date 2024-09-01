// /Users/rob/vsCodeProjects/project-zero-backend/src/services/word-processing-service/dictionary-api-test.ts
import axios from 'axios';

async function getDefinition(word: string): Promise<string | null> {
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

async function createWordDefinitionMap(words: string[]): Promise<Record<string, string>> {
  const wordDefinitionMap: Record<string, string> = {};

  for (const word of words) {
    const definition = await getDefinition(word);
    if (definition) {
      wordDefinitionMap[word] = definition;
    }
  }

  return wordDefinitionMap;
}

// Test the function
const testWords = ['hello', 'world', 'typescript', 'dictionary', 'deprivation', 'excess', 'finite'];

createWordDefinitionMap(testWords)
  .then((result) => {
    console.log('Word-Definition Map:');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error('Error:', error);
  });