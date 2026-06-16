import { create } from 'zustand';
import type { ChainWord, SoloGameState, DifficultyConfig, DifficultyLevel, ThemeType } from '@/types';
import { DIFFICULTY_CONFIGS } from '@/types';
import { getRandomStartWord, getRandomStartWordByTheme, getLastChar } from '@/utils/wordDatabase';
import { generatePlayerId, generateWordId } from '@/utils/helpers';
import { validateWord } from '@/utils/wordValidator';

interface SoloGameStore extends SoloGameState {
  playerId: string;
  playerName: string;
  validationMessage: string;
  lastValidationValid: boolean | null;
  difficulty: DifficultyConfig;
  theme: ThemeType | null;
  totalAttempts: number;
  initGame: (startWord?: string, playerName?: string, difficulty?: DifficultyLevel | DifficultyConfig, theme?: ThemeType | null) => void;
  submitWord: (word: string) => { success: boolean; message: string };
  endGame: () => void;
  restart: () => void;
  clearValidation: () => void;
}

const storedPlayerId = (() => {
  try {
    const saved = localStorage.getItem('wordchain_player_id');
    if (saved) return saved;
    const newId = generatePlayerId();
    localStorage.setItem('wordchain_player_id', newId);
    return newId;
  } catch {
    return generatePlayerId();
  }
})();

const storedPlayerName = (() => {
  try {
    return localStorage.getItem('wordchain_player_name') || '';
  } catch {
    return '';
  }
})();

function resolveDifficulty(difficulty?: DifficultyLevel | DifficultyConfig): DifficultyConfig {
  if (!difficulty) return DIFFICULTY_CONFIGS.normal;
  if (typeof difficulty === 'string') return DIFFICULTY_CONFIGS[difficulty];
  return difficulty;
}

export const useSoloGameStore = create<SoloGameStore>((set, get) => ({
  playerId: storedPlayerId,
  playerName: storedPlayerName || '脑洞玩家',
  chain: [],
  currentWord: '',
  startWord: '',
  score: 0,
  startTime: 0,
  status: 'playing',
  validationMessage: '',
  lastValidationValid: null,
  difficulty: DIFFICULTY_CONFIGS.normal,
  theme: null,
  totalAttempts: 0,

  initGame: (startWord, playerName, difficulty, theme) => {
    const word = startWord || (theme ? getRandomStartWordByTheme(theme) : getRandomStartWord());
    const name = playerName || storedPlayerName || '脑洞玩家';
    const diffConfig = resolveDifficulty(difficulty);
    try { localStorage.setItem('wordchain_player_name', name); } catch { /* ignore */ }
    const now = Date.now();
    const firstChain: ChainWord = {
      id: generateWordId(),
      word: word,
      authorId: 'system',
      authorName: '系统',
      authorColor: '#6366f1',
      timestamp: now,
      order: 0,
    };
    set({
      chain: [firstChain],
      currentWord: word,
      startWord: word,
      score: 0,
      startTime: now,
      status: 'playing',
      playerName: name,
      validationMessage: '',
      lastValidationValid: null,
      difficulty: diffConfig,
      theme: theme || null,
      totalAttempts: 0,
    });
  },

  submitWord: (word: string) => {
    const state = get();
    if (state.status !== 'playing') {
      return { success: false, message: '游戏已结束' };
    }
    const newAttempts = state.totalAttempts + 1;
    const { minLength, allowHomophone, containsMode } = state.difficulty;
    const result = validateWord(word, state.currentWord, state.chain, {
      minLength,
      allowHomophone,
      containsMode,
    });
    if (!result.valid) {
      set({ validationMessage: result.message, lastValidationValid: false, totalAttempts: newAttempts });
      return { success: false, message: result.message };
    }
    const trimmed = word.trim();
    const newChainWord: ChainWord = {
      id: generateWordId(),
      word: trimmed,
      authorId: state.playerId,
      authorName: state.playerName,
      authorColor: '#8b5cf6',
      timestamp: Date.now(),
      order: state.chain.length,
    };
    const newChain = [...state.chain, newChainWord];
    set({
      chain: newChain,
      currentWord: trimmed,
      score: state.score + 1,
      validationMessage: result.message,
      lastValidationValid: true,
      totalAttempts: newAttempts,
    });
    return { success: true, message: result.message };
  },

  endGame: () => set({ status: 'ended' }),

  restart: () => {
    const { difficulty, theme } = get();
    const word = theme ? getRandomStartWordByTheme(theme) : getRandomStartWord();
    const now = Date.now();
    const firstChain: ChainWord = {
      id: generateWordId(),
      word: word,
      authorId: 'system',
      authorName: '系统',
      authorColor: '#6366f1',
      timestamp: now,
      order: 0,
    };
    set({
      chain: [firstChain],
      currentWord: word,
      startWord: word,
      score: 0,
      startTime: now,
      status: 'playing',
      validationMessage: '',
      lastValidationValid: null,
      difficulty,
      totalAttempts: 0,
    });
  },

  clearValidation: () => set({ validationMessage: '', lastValidationValid: null }),
}));

export function getSoloCurrentLastChar(): string {
  return getLastChar(useSoloGameStore.getState().currentWord);
}
