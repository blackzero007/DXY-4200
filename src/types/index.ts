export interface Player {
  id: string;
  name: string;
  color: string;
  role: 'owner' | 'player' | 'watcher';
  score: number;
  isOnline: boolean;
  lastActive: number;
}

export interface ChainWord {
  id: string;
  word: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  timestamp: number;
  order: number;
}

export interface Room {
  id: string;
  name: string;
  status: 'waiting' | 'playing' | 'ended';
  ownerId: string;
  currentWord: string;
  startWord: string;
  chain: ChainWord[];
  players: Player[];
  currentTurnPlayerId: string | null;
  createdAt: number;
  reactions: { emoji: string; from: string; fromName: string; ts: number }[];
  turnTimeLimit?: number;
  passCount?: number;
}

export interface ValidationResult {
  valid: boolean;
  reason?: 'empty' | 'too_short' | 'start_mismatch' | 'duplicate' | 'not_found_last_char';
  message: string;
}

export type ChannelMessageType =
  | 'sync-room'
  | 'join-room'
  | 'leave-room'
  | 'add-word'
  | 'start-game'
  | 'end-game'
  | 'reaction'
  | 'kick-player'
  | 'request-sync'
  | 'player-active'
  | 'pass-turn';

export interface ChannelMessage {
  type: ChannelMessageType;
  payload: any;
  senderId: string;
  timestamp: number;
}

export interface SoloGameState {
  chain: ChainWord[];
  currentWord: string;
  startWord: string;
  score: number;
  startTime: number;
  status: 'playing' | 'ended';
}

export type GameMode = 'solo' | 'room';
