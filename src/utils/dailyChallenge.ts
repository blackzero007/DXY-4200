import { START_WORDS } from './wordDatabase';

export interface ChallengeRecord {
  playerName: string;
  score: number;
  chainLength: number;
  timestamp: number;
}

export interface DailyChallengeData {
  date: string;
  startWord: string;
  records: ChallengeRecord[];
  bestScore: number;
  bestPlayer: string | null;
}

const STORAGE_KEY_PREFIX = 'wordchain_daily_challenge_';
const PLAYER_NAME_KEY = 'wordchain_player_name';

export function getDateString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function hashDateToIndex(dateStr: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % max;
}

export function getStartWordForDate(date: Date): string {
  const dateStr = getDateString(date);
  const index = hashDateToIndex(dateStr, START_WORDS.length);
  return START_WORDS[index];
}

export function getStorageKey(date: Date): string {
  return STORAGE_KEY_PREFIX + getDateString(date);
}

export function getDailyChallengeData(date: Date): DailyChallengeData {
  const dateStr = getDateString(date);
  const startWord = getStartWordForDate(date);
  const storageKey = getStorageKey(date);

  let records: ChallengeRecord[] = [];
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      records = JSON.parse(saved);
    }
  } catch {
    records = [];
  }

  let bestScore = 0;
  let bestPlayer: string | null = null;

  if (records.length > 0) {
    const sorted = [...records].sort((a, b) => b.score - a.score);
    bestScore = sorted[0].score;
    bestPlayer = sorted[0].playerName;
  }

  return {
    date: dateStr,
    startWord,
    records,
    bestScore,
    bestPlayer,
  };
}

export function saveChallengeRecord(date: Date, record: ChallengeRecord): void {
  const storageKey = getStorageKey(date);
  const data = getDailyChallengeData(date);

  const existingIndex = data.records.findIndex(
    (r) => r.playerName === record.playerName
  );

  if (existingIndex >= 0) {
    if (record.score > data.records[existingIndex].score) {
      data.records[existingIndex] = record;
    }
  } else {
    data.records.push(record);
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(data.records));
  } catch {
    /* ignore */
  }
}

export function getPlayerName(): string {
  try {
    return localStorage.getItem(PLAYER_NAME_KEY) || '脑洞玩家';
  } catch {
    return '脑洞玩家';
  }
}

export function getLast7Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(date);
  }

  return days;
}

export function formatDateLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays === 2) return '前天';

  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return today.getTime() === target.getTime();
}
