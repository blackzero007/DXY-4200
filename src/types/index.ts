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

export type DifficultyLevel = 'easy' | 'normal' | 'hard';

export type ThemeType = 'food' | 'animal' | 'movie' | 'idiom' | 'nature';

export interface ThemeConfig {
  key: ThemeType;
  label: string;
  emoji: string;
  gradient: string;
}

export const THEME_CONFIGS: Record<ThemeType, ThemeConfig> = {
  food: {
    key: 'food',
    label: '美食',
    emoji: '🍜',
    gradient: 'from-orange-400 to-red-500',
  },
  animal: {
    key: 'animal',
    label: '动物',
    emoji: '🐾',
    gradient: 'from-emerald-400 to-teal-500',
  },
  movie: {
    key: 'movie',
    label: '电影',
    emoji: '🎬',
    gradient: 'from-violet-400 to-purple-500',
  },
  idiom: {
    key: 'idiom',
    label: '成语',
    emoji: '📜',
    gradient: 'from-amber-400 to-yellow-500',
  },
  nature: {
    key: 'nature',
    label: '自然',
    emoji: '🌿',
    gradient: 'from-cyan-400 to-blue-500',
  },
};

export const THEME_LIST: ThemeType[] = ['food', 'animal', 'movie', 'idiom', 'nature'];

export interface DifficultyConfig {
  level: DifficultyLevel;
  label: string;
  description: string;
  minLength: number;
  allowHomophone: boolean;
  containsMode: 'startWith' | 'contains';
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    level: 'easy',
    label: '简单',
    description: '允许同音字 · 最少2字 · 包含即可',
    minLength: 2,
    allowHomophone: true,
    containsMode: 'contains',
  },
  normal: {
    level: 'normal',
    label: '普通',
    description: '允许同音字 · 最少2字 · 首字匹配',
    minLength: 2,
    allowHomophone: true,
    containsMode: 'startWith',
  },
  hard: {
    level: 'hard',
    label: '困难',
    description: '禁用同音字 · 最少3字 · 严格首字匹配',
    minLength: 3,
    allowHomophone: false,
    containsMode: 'startWith',
  },
};
