import express from 'express';
import { testConnection, processText, processTextAsync, getResult } from './services/projectZeroAIClient';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to project-zero-backend!' });
});

app.get('/test-fastapi', async (req, res) => {
  try {
    const result = await testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to FastAPI service' });
  }
});

app.post('/process', async (req, res) => {
  try {
    const { content } = req.body;
    const result = await processText(content);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while processing the text' });
  }
});

app.post('/process-async', async (req, res) => {
  try {
    const { content } = req.body;
    const result = await processTextAsync(content);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while processing the text asynchronously' });
  }
});

app.get('/result/:taskId', async (req, res) => {
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