// src/services/user-node-service/index.ts

import express from 'express';
import { userNodeController } from './user.controller';
import { jwtCheck } from '../auth-service/authMiddleware';

const router = express.Router();

router.post('/users', jwtCheck, userNodeController.createUserNode);
router.get('/users/:userId', jwtCheck, userNodeController.getUserNode);
router.put('/users/:userId', jwtCheck, userNodeController.updateUserNode);
router.post('/users/node-creation', jwtCheck, userNodeController.addNodeCreation);
router.post('/users/node-interaction', jwtCheck, userNodeController.addNodeInteraction);
router.put('/users/preference', jwtCheck, userNodeController.updatePreference);

export default router;