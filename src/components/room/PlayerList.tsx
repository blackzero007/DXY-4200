import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Eye, Ban, ChevronDown, Wifi, WifiOff } from 'lucide-react';
import Avatar from '@/components/shared/Avatar';
import type { Player } from '@/types';

const ONLINE_TIMEOUT = 30 * 1000;

interface PlayerListProps {
  players: Player[];
  currentTurnPlayerId: string | null;
  isOwner: boolean;
  ownerId: string;
  localPlayerId: string;
  onKick?: (playerId: string) => void;
}

export default function PlayerList({
  players,
  currentTurnPlayerId,
  isOwner,
  localPlayerId,
  onKick,
}: PlayerListProps) {
  const [expanded, setExpanded] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const isPlayerOnline = useCallback((player: Player): boolean => {
    if (player.id === localPlayerId) return true;
    return Date.now() - player.lastActive < ONLINE_TIMEOUT;
  }, [localPlayerId]);

  const realPlayers = players.filter(p => p.role !== 'watcher');
  const watchers = players.filter(p => p.role === 'watcher');

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const aOnline = isPlayerOnline(a);
      const bOnline = isPlayerOnline(b);
      if (aOnline && !bOnline) return -1;
      if (!aOnline && bOnline) return 1;
      if (a.role === 'owner' && b.role !== 'owner') return -1;
      if (b.role === 'owner' && a.role !== 'owner') return 1;
      if (a.role === 'watcher' && b.role !== 'watcher') return 1;
      if (b.role === 'watcher' && a.role !== 'watcher') return -1;
      return b.score - a.score;
    });
  }, [players, tick, isPlayerOnline]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-panel rounded-3xl overflow-hidden border border-white/10"
    >
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 md:px-5 py-3 md:py-3.5 border-b border-white/10 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <div className="text-white font-display text-base md:text-lg leading-tight">
              玩家大厅
            </div>
            <div className="text-[11px] md:text-xs text-white/55">
              {realPlayers.length} 玩家 · {watchers.length} 围观
            </div>
          </div>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 0 : -90 }}
          transition={{ duration: 0.25 }}
          className="text-white/50"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-3 md:p-4 space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar">
              {sortedPlayers.map((p, idx) => {
                const isCurrentTurn = currentTurnPlayerId === p.id;
                const isLocal = p.id === localPlayerId;
                const isMenuOpen = menuOpen === p.id;
                const online = isPlayerOnline(p);

                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.35, layout: { duration: 0.3 } }}
                    className={`relative flex items-center gap-3 p-2.5 md:p-3 rounded-2xl transition-all ${
                      isCurrentTurn
                        ? 'bg-purple-500/15 border border-purple-400/40 shadow-glow-purple/50'
                        : online
                        ? 'hover:bg-white/5 border border-transparent'
                        : 'bg-white/[0.02] border border-white/5'
                    }`}
                  >
                    <Avatar
                      name={p.name}
                      color={p.color}
                      size="md"
                      isOwner={p.role === 'owner'}
                      isWatcher={p.role === 'watcher'}
                      isOnline={online}
                      isCurrentTurn={isCurrentTurn}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-medium truncate ${
                          isLocal ? 'text-purple-200' : online ? 'text-white/90' : 'text-white/40'
                        }`}>
                          {p.name}
                          {isLocal && <span className="text-xs ml-1 text-purple-300">(我)</span>}
                        </span>
                        {p.role === 'watcher' && (
                          <Eye className={`w-3 h-3 shrink-0 ${online ? 'text-sky-400' : 'text-sky-400/40'}`} />
                        )}
                        {!online && (
                          <span className="inline-flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-full bg-zinc-500/20 text-zinc-400 text-[10px] font-medium">
                            <WifiOff className="w-2.5 h-2.5" />
                            离线
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        {online ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <Wifi className="w-3 h-3" />
                            在线
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-zinc-500">
                            <WifiOff className="w-3 h-3" />
                            离线
                          </span>
                        )}
                        <span className={online ? 'text-white/55' : 'text-white/30'}>·</span>
                        <span className={online ? 'text-white/55' : 'text-white/30'}>
                          接词 {p.score} 次
                        </span>
                        {isCurrentTurn && (
                          <>
                            <span className="text-white/55">·</span>
                            <span className="text-purple-300 font-medium animate-pulse">
                              回合中 ⏳
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {isOwner && p.role !== 'owner' && (
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(isMenuOpen ? null : p.id)}
                          className="shrink-0 w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                        >
                          <span className="text-lg leading-none">⋮</span>
                        </button>
                        <AnimatePresence>
                          {isMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.85, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.85, y: -10 }}
                              className="absolute right-0 top-full mt-2 z-30 min-w-[120px] glass-panel rounded-2xl p-1.5 border border-white/10 shadow-xl"
                            >
                              <button
                                onClick={() => {
                                  onKick?.(p.id);
                                  setMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-rose-300 hover:bg-rose-500/15 transition-colors"
                              >
                                <Ban className="w-4 h-4" />
                                移出房间
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
