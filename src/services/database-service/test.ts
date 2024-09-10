// src/services/database-service/test.ts

import { databaseService } from './index';

async function testDatabaseService() {
  try {
    console.log("Starting database service test...");

    // Initialize the database service
    await databaseService.initialize();
    console.log("Database service initialized successfully");

    // Add a word
    await databaseService.addWord('example', 'This is an example definition', 'text123');
    console.log('Word added successfully');

    // Retrieve the word
    const result = await databaseService.getWord('example');
    console.log('Retrieved word:', result);

    // Try to retrieve a non-existent word
    const nonExistentResult = await databaseService.getWord('nonexistentword');
    console.log('Retrieved non-existent word:', nonExistentResult);

    console.log("Database service test completed successfully");
  } catch (error) {
    console.error('Error in database service test:', error);
  } finally {
    await databaseService.close();
  }
}

testDatabaseService();