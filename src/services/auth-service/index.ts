// src/services/auth-service/index.ts

import express from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
import authRoutes from './routes';

dotenv.config();

const app = express();
const port = process.env.AUTH_SERVICE_PORT || 4000;

app.use(express.json());

export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});

// Health check route (unprotected)
app.get('/auth/health', (req, res) => {
  res.json({ status: 'Auth Service is healthy' });
});

// Use auth routes
app.use('/auth', authRoutes);

// Middleware to check JWT on protected routes
app.use('/auth/api', jwtCheck);

// Test protected route
app.get('/auth/api/authorized', (req, res) => {
  res.json({ message: 'Secured Resource', user: req.auth });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Auth Service running on port ${port}`);
  });
}

export { app };