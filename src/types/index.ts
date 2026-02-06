export interface Document {
  id: string;
  title: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
}

export interface DocumentCollaborator {
  document_id: string;
  user_id: string;
  permission: 'read' | 'write' | 'admin';
}

export interface UserPresence {
  userId: string;
  userName: string;
  userColor: string;
  cursor?: {
    x: number;
    y: number;
  };
}

export type ConnectionStatus = 'online' | 'offline' | 'syncing';
