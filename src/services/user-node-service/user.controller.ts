// src/services/user-node-service/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import { userNodeService } from './user.service';
import { UserNode } from './user.model';
import { AuthRequest } from '../auth-service/authMiddleware';

export class UserNodeController {
  createUserNode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: Partial<UserNode> = req.body;
      const newUser = await userNodeService.createUserNode(userData);
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }

  getUserNode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId;
      const requestingUserId = (req as AuthRequest).auth?.payload.sub;

      let userData;
      if (userId === requestingUserId) {
        userData = await userNodeService.getUserNodePrivate(userId);
      } else {
        userData = await userNodeService.getUserNodePublic(userId);
      }

      if (userData) {
        res.json(userData);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      next(error);
    }
  }

  updateUserNode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId;
      const updates: Partial<UserNode> = req.body;
      const updatedUser = await userNodeService.updateUserNode(userId, updates);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  addNodeCreation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, nodeType, nodeId } = req.body;
      await userNodeService.addNodeCreation(userId, nodeType, nodeId);
      res.status(200).json({ message: 'Node creation added successfully' });
    } catch (error) {
      next(error);
    }
  }

  addNodeInteraction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, nodeType, nodeId } = req.body;
      await userNodeService.addNodeInteraction(userId, nodeType, nodeId);
      res.status(200).json({ message: 'Node interaction added successfully' });
    } catch (error) {
      next(error);
    }
  }

  updatePreference = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, nodeId, visibility } = req.body;
      await userNodeService.updatePreference(userId, nodeId, visibility);
      res.status(200).json({ message: 'Preference updated successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const userNodeController = new UserNodeController();