// src/services/auth-service/routes.ts

import express, { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import { jwtCheck } from './authMiddleware';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const response = await axios.post(`https://${process.env.AUTH0_DOMAIN}/dbconnections/signup`, {
      client_id: process.env.AUTH0_CLIENT_ID,
      email,
      password,
      connection: 'Username-Password-Authentication',
      name
    });
    res.status(201).json({ message: 'User registered successfully', userId: response.data._id });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(400).json({ message: 'Registration failed', error: error.response?.data || error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const response = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      grant_type: 'password',
      username: email,
      password,
      audience: process.env.AUTH0_AUDIENCE,
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET
    });
    res.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(401).json({ message: 'Login failed', error: error.response?.data || error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
});

router.post('/refresh-token', async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    const response = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      grant_type: 'refresh_token',
      refresh_token,
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET
    });
    res.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(400).json({ message: 'Token refresh failed', error: error.response?.data || error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
});

router.get('/user-profile', jwtCheck, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header present' });
    }
    const response = await axios.get(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
      headers: { Authorization: authHeader }
    });
    res.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(400).json({ message: 'Failed to get user profile', error: error.response?.data || error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.json({ message: 'Logout successful. Remember to clear the token on the client side.' });
});

export default router;