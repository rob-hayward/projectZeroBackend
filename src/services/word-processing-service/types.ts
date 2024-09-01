interface Definition {
    text: string;
    votes: number;
  }
  
  interface WordEntry {
    definitions: Definition[];
    dataIds: string[];
  }
  
  interface WordDictionary {
    [word: string]: WordEntry;
  }
  
  export { Definition, WordEntry, WordDictionary };