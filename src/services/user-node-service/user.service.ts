// src/services/user-node-service/user.service.ts

import { getSession } from '../../database/neo4j';
import { UserNode, UserNodePublic, UserNodePrivate } from './user.model';

export class UserNodeService {
  async createUserNode(userData: Partial<UserNode>): Promise<UserNodePrivate> {
    const session = getSession();
    try {
      const result = await session.run(
        `CREATE (u:UserNode {
          id: $id,
          username: $username,
          missionStatement: $missionStatement,
          verificationStatus: $verificationStatus,
          createdAt: datetime(),
          lastActive: datetime(),
          email: $email,
          phoneNumber: $phoneNumber,
          address: $address
        }) RETURN u`,
        userData
      );
      return result.records[0].get('u').properties as UserNodePrivate;
    } finally {
      await session.close();
    }
  }

  async getUserNodePublic(userId: string): Promise<UserNodePublic | null> {
    const session = getSession();
    try {
      const result = await session.run(
        `MATCH (u:UserNode {id: $userId})
         RETURN u {
           .id, .username, .missionStatement, .verificationStatus, 
           .createdAt, .lastActive, .nodeCreations, .nodeInteractions
         }`,
        { userId }
      );
      return result.records[0]?.get('u') as UserNodePublic || null;
    } finally {
      await session.close();
    }
  }

  async getUserNodePrivate(userId: string): Promise<UserNodePrivate | null> {
    const session = getSession();
    try {
      const result = await session.run(
        `MATCH (u:UserNode {id: $userId})
         RETURN u`,
        { userId }
      );
      return result.records[0]?.get('u').properties as UserNodePrivate || null;
    } finally {
      await session.close();
    }
  }

  async updateUserNode(userId: string, updates: Partial<UserNode>): Promise<UserNodePrivate> {
    const session = getSession();
    try {
      const result = await session.run(
        `MATCH (u:UserNode {id: $userId})
         SET u += $updates, u.lastActive = datetime()
         RETURN u`,
        { userId, updates }
      );
      return result.records[0].get('u').properties as UserNodePrivate;
    } finally {
      await session.close();
    }
  }

  async addNodeCreation(userId: string, nodeType: string, nodeId: string): Promise<void> {
    const session = getSession();
    try {
      await session.run(
        `MATCH (u:UserNode {id: $userId})
         SET u.nodeCreations = CASE
           WHEN u.nodeCreations IS NULL THEN {$nodeType: [$nodeId]}
           WHEN NOT $nodeType IN keys(u.nodeCreations) THEN u.nodeCreations + {$nodeType: [$nodeId]}
           ELSE u.nodeCreations + {$nodeType: u.nodeCreations[$nodeType] + $nodeId}
         END`,
        { userId, nodeType, nodeId }
      );
    } finally {
      await session.close();
    }
  }

  async addNodeInteraction(userId: string, nodeType: string, nodeId: string): Promise<void> {
    const session = getSession();
    try {
      await session.run(
        `MATCH (u:UserNode {id: $userId})
         SET u.nodeInteractions = CASE
           WHEN u.nodeInteractions IS NULL THEN {$nodeType: [$nodeId]}
           WHEN NOT $nodeType IN keys(u.nodeInteractions) THEN u.nodeInteractions + {$nodeType: [$nodeId]}
           ELSE u.nodeInteractions + {$nodeType: u.nodeInteractions[$nodeType] + $nodeId}
         END`,
        { userId, nodeType, nodeId }
      );
    } finally {
      await session.close();
    }
  }

  async updatePreference(userId: string, nodeId: string, visibility: 'show' | 'hide'): Promise<void> {
    const session = getSession();
    try {
      await session.run(
        `MATCH (u:UserNode {id: $userId})
         SET u.preferences = CASE
           WHEN u.preferences IS NULL THEN {$nodeId: $visibility}
           ELSE u.preferences + {$nodeId: $visibility}
         END`,
        { userId, nodeId, visibility }
      );
    } finally {
      await session.close();
    }
  }
}

export const userNodeService = new UserNodeService();