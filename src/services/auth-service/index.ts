// src/services/auth-service/index.ts

import express from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.AUTH_SERVICE_PORT || 4000;

export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});

// Middleware to check JWT on protected routes
app.use('/api', jwtCheck);

// Test protected route
app.get('/api/authorized', (req, res) => {
  res.json({ message: 'Secured Resource', user: req.auth });
});

// Health check route (unprotected)
app.get('/health', (req, res) => {
  res.json({ status: 'Auth Service is healthy' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Auth Service running on port ${port}`);
  });
}

export default app;