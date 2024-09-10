// src/services/database-service/neo4j.ts

import neo4j, { Driver } from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

let driver: Driver;

export function initDatabase(): void {
  const URI = `${process.env.PROTOCOL}${process.env.CONNECTION_URL}`;
  const USER = process.env.NEO4J_USER || 'neo4j';
  const PASSWORD = process.env.NEO4J_PASSWORD || '';

  driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
}

export function getDriver(): Driver {
  if (!driver) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return driver;
}

export async function closeDatabase(): Promise<void> {
  if (driver) {
    await driver.close();
  }
}