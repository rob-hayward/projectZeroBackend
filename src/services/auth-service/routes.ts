// src/services/auth-service/routes.ts

import express, { Request, Response } from 'express';
import axios from 'axios';
import { jwtCheck } from './authMiddleware';
import { userNodeService } from '../user-node-service/user.service';

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

    // Create user node in Neo4j
    await userNodeService.createUserNode({
      id: response.data._id,
      username: name,
      email: email,
      verificationStatus: 'unverified'
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

// ... rest of the routes

export default router;