// src/services/auth-service/authMiddleware.ts

import { auth, UnauthorizedError, AuthResult } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// Ensure required environment variables are set
if (!process.env.AUTH0_AUDIENCE || !process.env.AUTH0_DOMAIN) {
  throw new Error('Missing required AUTH0 environment variables');
}

export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof UnauthorizedError) {
    res.status(401).json({ message: 'Invalid token', error: err.message });
  } else {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// Extend Express Request type to include auth property
declare global {
  namespace Express {
    interface Request {
      auth?: AuthResult;
    }
  }
}

// Helper type to access payload properties
export type AuthRequest = Request & {
  auth?: AuthResult & {
    payload: {
      sub: string;
      [key: string]: any;
    }
  }
};