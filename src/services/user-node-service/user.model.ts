// src/services/user-node-service/user.model.ts

export interface UserNode {
  id: string;  // This should match the Auth0 user ID
  username: string;
  missionStatement?: string;
  verificationStatus: 'unverified' | 'verified';
  createdAt: Date;
  lastActive: Date;
  nodeCreations: {
    [nodeType: string]: string[];  // e.g., { 'beliefnode': ['id1', 'id2'], 'wordnode': ['id3'] }
  };
  nodeInteractions: {
    [nodeType: string]: string[];
  };
  preferences: {
    [nodeId: string]: 'show' | 'hide';
  };
  // Public properties
  email?: string;
  // Private properties (not to be sent to frontend unless it's the user themselves)
  phoneNumber?: string;
  address?: string;
}

export interface UserNodePublic extends Pick<UserNode, 'id' | 'username' | 'missionStatement' | 'verificationStatus' | 'createdAt' | 'lastActive' | 'nodeCreations' | 'nodeInteractions'> {}

export interface UserNodePrivate extends UserNode {}