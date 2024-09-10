// src/services/database-service/index.ts

import { Driver, Session } from 'neo4j-driver';
import { initDatabase, getDriver, closeDatabase } from './neo4j';
import fs from 'fs';
import path from 'path';

export class DatabaseService {
  private databaseName: string;

  constructor() {
    this.databaseName = process.env.DATABASE_NAME || 'neo4j';
  }

  async initialize(): Promise<void> {
    initDatabase();
    const driver = getDriver();
    const serverInfo = await driver.verifyConnectivity();
    console.log('Connection established');
    console.log(serverInfo);

    // Verify that the database exists
    const session = this.getSession();
    try {
      await session.run('RETURN 1');
      console.log(`Successfully connected to database: ${this.databaseName}`);
    } catch (error) {
      console.error(`Error connecting to database ${this.databaseName}:`, error);
      throw error;
    } finally {
      await session.close();
    }
  }

  getSession(): Session {
    const driver = getDriver();
    return driver.session({ database: this.databaseName });
  }

  async addWord(word: string, definition: string, textId: string): Promise<void> {
    const session = this.getSession();
    try {
      await session.writeTransaction(async (tx) => {
        await tx.run(
          `
          MERGE (w:Word {word: $word})
          MERGE (d:Definition {text: $definition})
          MERGE (t:Text {id: $textId})
          MERGE (w)-[:HAS_DEFINITION]->(d)
          MERGE (t)-[:CONTAINS]->(w)
          `,
          { word, definition, textId }
        );
      });
      console.log(`Word '${word}' added successfully`);
    } catch (error) {
      console.error(`Error adding word '${word}':`, error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async getWord(word: string): Promise<any> {
    const session = this.getSession();
    try {
      const result = await session.readTransaction(async (tx) => {
        const response = await tx.run(
          `
          MATCH (w:Word {word: $word})-[:HAS_DEFINITION]->(d:Definition)
          RETURN w.word AS word, collect(d.text) AS definitions
          `,
          { word }
        );
        return response.records[0];
      });
      if (result) {
        console.log(`Word '${word}' retrieved successfully`);
      } else {
        console.log(`Word '${word}' not found`);
      }
      return result ? result.toObject() : null;
    } catch (error) {
      console.error(`Error retrieving word '${word}':`, error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async close(): Promise<void> {
    await closeDatabase();
  }

  async initializeSchema(): Promise<void> {
    const session = this.getSession();
    try {
      const schemaFile = fs.readFileSync(path.join(__dirname, 'schema.cypher'), 'utf8');
      const statements = schemaFile.split(';').filter(stmt => stmt.trim() !== '');
      
      for (let statement of statements) {
        await session.run(statement);
      }
      console.log('Database schema initialized successfully');
    } catch (error) {
      console.error('Error initializing database schema:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

}

export const databaseService = new DatabaseService();