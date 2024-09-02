// src/services/word-processing-service/types.ts

export interface Definition {
  text: string | null;
  votes: number;
}

export interface WordEntry {
  definitions: Definition[];
  dataIds: string[];
}

export interface WordDictionary {
  [word: string]: WordEntry;
}
