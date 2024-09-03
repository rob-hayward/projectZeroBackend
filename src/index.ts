// src/index.ts

import express from 'express';
import dotenv from 'dotenv';
import { testConnection, processText, processTextAsync, getResult } from './services/projectZeroAIClient/projectZeroAIClient';
import authService, { jwtCheck } from './services/auth-service';

dotenv.config();

const app = express();
const port = process.env.MAIN_APP_PORT || 3000;

app.use(express.json());

// Mount the auth service
app.use('/auth', authService);

// Public route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to project-zero-backend!' });
});

// Protected routes
app.use('/api', jwtCheck);

app.get('/api/test-fastapi', async (req, res) => {
  try {
    const result = await testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to FastAPI service' });
  }
});

app.post('/api/process', async (req, res) => {
  try {
    const { content } = req.body;
    const result = await processText(content);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while processing the text' });
  }
});

app.post('/api/process-async', async (req, res) => {
  try {
    const { content } = req.body;
    const result = await processTextAsync(content);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while processing the text asynchronously' });
  }
});

app.get('/api/result/:taskId', async (req, res) => {
  try {
    const result = await getResult(req.params.taskId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while getting the result' });
  }
});

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { app, server };