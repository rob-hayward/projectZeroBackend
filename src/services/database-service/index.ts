// src/services/database-service/index.ts

import neo4j, { Driver, Session } from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

export class DatabaseService {
  private driver!: Driver;
  private databaseName: string;

  constructor() {
    // Use 'neo4j' as the default database name
    this.databaseName = process.env.DATABASE_NAME || 'neo4j';
  }

  async initialize(): Promise<void> {
    const URI = `${process.env.PROTOCOL}${process.env.CONNECTION_URL}`;
    const USER = process.env.NEO4J_USER || 'neo4j';
    const PASSWORD = process.env.NEO4J_PASSWORD || '';

    try {
      this.driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
      const serverInfo = await this.driver.verifyConnectivity();
      console.log('Connection established');
      console.log(serverInfo);

      // Verify that the database exists
      const session = this.driver.session();
      try {
        await session.run('RETURN 1');
        console.log(`Successfully connected to database: ${this.databaseName}`);
      } catch (error) {
        console.error(`Error connecting to database ${this.databaseName}:`, error);
        throw error;
      } finally {
        await session.close();
      }
    } catch (err) {
      console.log(`Connection error\n${err}`);
      throw err;
    }
  }

  private getSession(): Session {
    if (!this.driver) {
      throw new Error('Driver not initialized. Call initialize() first.');
    }
    return this.driver.session({ database: this.databaseName });
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
    if (this.driver) {
      await this.driver.close();
    }
  }
}