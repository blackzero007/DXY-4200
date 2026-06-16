import { create } from 'zustand';
import type { Room, Player, ChainWord, ChannelMessage } from '@/types';
import { generateRoomCode, generatePlayerId, generateWordId, getPlayerColor, getPlayerColorHex } from '@/utils/helpers';
import { getRandomStartWord } from '@/utils/wordDatabase';
import { validateWord } from '@/utils/wordValidator';

interface RoomStore {
  room: Room | null;
  localPlayerId: string;
  localPlayerName: string;
  validationMessage: string;
  lastValidationValid: boolean | null;
  lastReaction: { emoji: string; fromName: string; id: number } | null;
  setRoom: (room: Room | null) => void;
  createRoom: (ownerName: string, roomName?: string) => { roomId: string; playerId: string };
  joinRoom: (roomId: string, playerName: string, asWatcher?: boolean) => { playerId: string; success: boolean; message: string };
  startGame: (playerId: string, customStartWord?: string) => boolean;
  submitWord: (playerId: string, word: string) => { success: boolean; message: string };
  passTurn: (playerId: string) => void;
  kickPlayer: (ownerId: string, targetPlayerId: string) => boolean;
  endGame: (playerId: string) => boolean;
  sendReaction: (playerId: string, emoji: string) => void;
  applyChannelMessage: (msg: ChannelMessage) => void;
  syncRoomFromStorage: (roomId: string) => boolean;
  cleanupRoom: () => void;
  updatePlayerActive: (playerId: string) => void;
  clearValidation: () => void;
  clearLastReaction: () => void;
  getNextPlayerId: () => string | null;
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

function persistRoom(room: Room) {
  try {
    localStorage.setItem(`wordchain_room_${room.id}`, JSON.stringify(room));
  } catch {}
}

function loadRoom(roomId: string): Room | null {
  try {
    const raw = localStorage.getItem(`wordchain_room_${roomId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  room: null,
  localPlayerId: storedPlayerId,
  localPlayerName: storedPlayerName,
  validationMessage: '',
  lastValidationValid: null,
  lastReaction: null,

  setRoom: (room) => {
    set({ room });
    if (room) persistRoom(room);
  },

  createRoom: (ownerName, roomName) => {
    const roomId = generateRoomCode();
    const ownerId = storedPlayerId;
    try { localStorage.setItem('wordchain_player_name', ownerName); } catch {}
    const now = Date.now();
    const newRoom: Room = {
      id: roomId,
      name: roomName || `${ownerName}的脑洞房间`,
      status: 'waiting',
      ownerId,
      currentWord: '',
      startWord: '',
      chain: [],
      players: [
        {
          id: ownerId,
          name: ownerName,
          color: getPlayerColor(0),
          role: 'owner',
          score: 0,
          isOnline: true,
          lastActive: now,
        },
      ],
      currentTurnPlayerId: null,
      createdAt: now,
      reactions: [],
      passCount: 0,
      turnTimeLimit: 30,
    };
    set({ room: newRoom, localPlayerId: ownerId, localPlayerName: ownerName });
    persistRoom(newRoom);
    return { roomId, playerId: ownerId };
  },

  joinRoom: (roomId, playerName, asWatcher = false) => {
    try { localStorage.setItem('wordchain_player_name', playerName); } catch {}
    const saved = loadRoom(roomId);
    if (!saved) {
      return { playerId: '', success: false, message: '房间不存在或已过期' };
    }
    const playerId = storedPlayerId;
    const existing = saved.players.find(p => p.id === playerId);
    const now = Date.now();
    let room = { ...saved };
    if (existing) {
      room.players = saved.players.map(p =>
        p.id === playerId ? { ...p, name: playerName, isOnline: true, lastActive: now } : p
      );
    } else {
      const colorIdx = saved.players.length;
      const newPlayer: Player = {
        id: playerId,
        name: playerName,
        color: getPlayerColor(colorIdx),
        role: asWatcher ? 'watcher' : 'player',
        score: 0,
        isOnline: true,
        lastActive: now,
      };
      room = { ...room, players: [...saved.players, newPlayer] };
    }
    set({ room, localPlayerId: playerId, localPlayerName: playerName });
    persistRoom(room);
    return { playerId, success: true, message: '加入成功' };
  },

  startGame: (playerId, customStartWord) => {
    const state = get();
    const room = state.room;
    if (!room) return false;
    if (room.ownerId !== playerId) return false;
    if (room.status === 'playing') return false;
    const startWord = customStartWord || getRandomStartWord();
    const now = Date.now();
    const firstChain: ChainWord = {
      id: generateWordId(),
      word: startWord,
      authorId: 'system',
      authorName: '系统',
      authorColor: '#6366f1',
      timestamp: now,
      order: 0,
    };
    const realPlayers = room.players.filter(p => p.role !== 'watcher');
    const firstPlayerId = realPlayers.length > 0 ? realPlayers[0].id : null;
    const newRoom: Room = {
      ...room,
      status: 'playing',
      startWord,
      currentWord: startWord,
      chain: [firstChain],
      currentTurnPlayerId: firstPlayerId,
      createdAt: now,
      reactions: [],
      passCount: 0,
      turnStartTime: now,
      players: room.players.map(p => ({ ...p, score: 0 })),
    };
    set({ room: newRoom, validationMessage: '', lastValidationValid: null });
    persistRoom(newRoom);
    return true;
  },

  submitWord: (playerId, word) => {
    const state = get();
    const room = state.room;
    if (!room) return { success: false, message: '房间不存在' };
    if (room.status !== 'playing') return { success: false, message: '游戏尚未开始' };
    if (room.currentTurnPlayerId !== playerId) {
      return { success: false, message: '还没轮到你哦' };
    }
    const result = validateWord(word, room.currentWord, room.chain);
    if (!result.valid) {
      set({ validationMessage: result.message, lastValidationValid: false });
      return { success: false, message: result.message };
    }
    const trimmed = word.trim();
    const player = room.players.find(p => p.id === playerId);
    const newChainWord: ChainWord = {
      id: generateWordId(),
      word: trimmed,
      authorId: playerId,
      authorName: player?.name || '匿名',
      authorColor: player?.color ? (player.color.match(/#[0-9a-fA-F]{6}/)?.[0] || getPlayerColorHex(0)) : getPlayerColorHex(0),
      timestamp: Date.now(),
      order: room.chain.length,
    };
    const newPlayers = room.players.map(p =>
      p.id === playerId ? { ...p, score: p.score + 1 } : p
    );
    const realPlayers = newPlayers.filter(p => p.role !== 'watcher');
    const idx = realPlayers.findIndex(p => p.id === playerId);
    const nextPlayerId = realPlayers.length > 0
      ? realPlayers[(idx + 1) % realPlayers.length].id
      : null;
    const newRoom: Room = {
      ...room,
      chain: [...room.chain, newChainWord],
      currentWord: trimmed,
      players: newPlayers,
      currentTurnPlayerId: nextPlayerId,
      passCount: 0,
      turnStartTime: Date.now(),
    };
    set({ room: newRoom, validationMessage: result.message, lastValidationValid: true });
    persistRoom(newRoom);
    return { success: true, message: result.message };
  },

  passTurn: (playerId) => {
    const state = get();
    const room = state.room;
    if (!room || room.status !== 'playing') return;
    if (room.currentTurnPlayerId !== playerId) return;
    const realPlayers = room.players.filter(p => p.role !== 'watcher');
    const idx = realPlayers.findIndex(p => p.id === playerId);
    const nextPlayerId = realPlayers.length > 0
      ? realPlayers[(idx + 1) % realPlayers.length].id
      : null;
    const passCount = (room.passCount || 0) + 1;
    let status: Room['status'] = room.status;
    if (passCount >= realPlayers.length && realPlayers.length > 1) {
      status = 'ended';
    }
    const newRoom: Room = {
      ...room,
      currentTurnPlayerId: status === 'ended' ? null : nextPlayerId,
      passCount,
      status,
      turnStartTime: status === 'ended' ? undefined : Date.now(),
    };
    set({ room: newRoom });
    persistRoom(newRoom);
  },

  kickPlayer: (ownerId, targetPlayerId) => {
    const state = get();
    const room = state.room;
    if (!room || room.ownerId !== ownerId) return false;
    if (targetPlayerId === ownerId) return false;
    const newPlayers = room.players.filter(p => p.id !== targetPlayerId);
    const realPlayers = newPlayers.filter(p => p.role !== 'watcher');
    let newTurnId = room.currentTurnPlayerId;
    if (room.currentTurnPlayerId === targetPlayerId && realPlayers.length > 0) {
      newTurnId = realPlayers[0].id;
    }
    const newRoom: Room = {
      ...room,
      players: newPlayers,
      currentTurnPlayerId: newTurnId,
    };
    set({ room: newRoom });
    persistRoom(newRoom);
    return true;
  },

  endGame: (playerId) => {
    const state = get();
    const room = state.room;
    if (!room || room.ownerId !== playerId) return false;
    const newRoom: Room = { ...room, status: 'ended', currentTurnPlayerId: null };
    set({ room: newRoom });
    persistRoom(newRoom);
    return true;
  },

  sendReaction: (playerId, emoji) => {
    const state = get();
    const room = state.room;
    if (!room) return;
    const player = room.players.find(p => p.id === playerId);
    const reaction = { emoji, from: playerId, fromName: player?.name || '', ts: Date.now() };
    const newRoom: Room = {
      ...room,
      reactions: [...room.reactions.slice(-50), reaction],
    };
    set({
      room: newRoom,
      lastReaction: { emoji, fromName: reaction.fromName, id: Date.now() },
    });
    persistRoom(newRoom);
  },

  applyChannelMessage: (msg) => {
    const state = get();
    if (msg.senderId === state.localPlayerId && msg.type !== 'sync-room') return;
    switch (msg.type) {
      case 'sync-room':
        if (msg.payload?.room) {
          set({ room: msg.payload.room });
          persistRoom(msg.payload.room);
        }
        break;
      case 'join-room': {
        const room = get().room;
        if (room && msg.payload?.player) {
          const exists = room.players.some(p => p.id === msg.payload.player.id);
          if (!exists) {
            const newRoom = { ...room, players: [...room.players, msg.payload.player] };
            set({ room: newRoom });
            persistRoom(newRoom);
          }
        }
        break;
      }
      case 'leave-room': {
        const room = get().room;
        if (room && msg.payload?.playerId) {
          const newPlayers = room.players.filter(p => p.id !== msg.payload.playerId);
          const realPlayers = newPlayers.filter(p => p.role !== 'watcher');
          let newTurnId = room.currentTurnPlayerId;
          if (room.currentTurnPlayerId === msg.payload.playerId && realPlayers.length > 0) {
            const idx = Math.max(0, room.players.findIndex(p => p.id === msg.payload.playerId));
            newTurnId = realPlayers[idx % realPlayers.length]?.id || realPlayers[0].id;
          }
          const newRoom = { ...room, players: newPlayers, currentTurnPlayerId: newTurnId };
          set({ room: newRoom });
          persistRoom(newRoom);
        }
        break;
      }
      case 'start-game':
      case 'add-word':
      case 'pass-turn':
      case 'kick-player':
      case 'end-game':
      case 'reaction':
      case 'player-active':
        if (msg.payload?.room) {
          set({ room: msg.payload.room });
          persistRoom(msg.payload.room);
          if (msg.type === 'reaction' && msg.payload.lastReaction) {
            set({ lastReaction: msg.payload.lastReaction });
          }
        }
        break;
      case 'request-sync': {
        const room = get().room;
        if (room) persistRoom(room);
        break;
      }
    }
  },

  syncRoomFromStorage: (roomId) => {
    const room = loadRoom(roomId);
    if (room) {
      set({ room });
      return true;
    }
    return false;
  },

  cleanupRoom: () => {
    const room = get().room;
    if (!room) return;
    try {
      if (room.ownerId === get().localPlayerId) {
        localStorage.removeItem(`wordchain_room_${room.id}`);
      } else {
        const loaded = loadRoom(room.id);
        if (loaded) {
          const now = Date.now();
          const newPlayers = loaded.players.map(p =>
            p.id === get().localPlayerId
              ? { ...p, isOnline: false, lastActive: now }
              : p
          );
          const newRoom = { ...loaded, players: newPlayers };
          localStorage.setItem(`wordchain_room_${room.id}`, JSON.stringify(newRoom));
        }
      }
    } catch {}
    set({ room: null, validationMessage: '', lastValidationValid: null });
  },

  updatePlayerActive: (playerId) => {
    const room = get().room;
    if (!room) return;
    const now = Date.now();
    const newPlayers = room.players.map(p =>
      p.id === playerId ? { ...p, isOnline: true, lastActive: now } : p
    );
    const newRoom = { ...room, players: newPlayers };
    set({ room: newRoom });
  },

  clearValidation: () => set({ validationMessage: '', lastValidationValid: null }),

  clearLastReaction: () => set({ lastReaction: null }),

  getNextPlayerId: () => {
    const room = get().room;
    if (!room) return null;
    return room.currentTurnPlayerId;
  },
}));
