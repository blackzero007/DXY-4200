import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BarChart3 } from 'lucide-react';
import { useChainStats } from '@/hooks/useChainStats';
import type { ChainWord } from '@/types';

interface ChainStatsPanelProps {
  chain: ChainWord[];
  showPlayerContributions?: boolean;
}

export default function ChainStatsPanel({ chain, showPlayerContributions = false }: ChainStatsPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const stats = useChainStats(chain);

  const hasData = stats.totalWords > 0;

  return (
    <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <h3 className="font-display text-lg text-white flex items-center gap-2">
          <BarChart3 className="w-4.5 h-4.5 text-purple-300" />
          词链统计
        </h3>
        <motion.div
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4.5 h-4.5 text-white/50" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3 text-sm text-white/70">
              <div className="flex justify-between">
                <span className="text-white/40">总词数</span>
                <span className="font-display text-base text-gradient">{stats.totalWords}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-white/40">平均词长</span>
                <span className="font-display text-base text-white/90">{hasData ? stats.avgLength : '—'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/40">最长词</span>
                <span className="font-display text-base text-emerald-300 truncate max-w-[60%] text-right">
                  {hasData ? stats.longestWord : '—'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/40">最短词</span>
                <span className="font-display text-base text-amber-300 truncate max-w-[60%] text-right">
                  {hasData ? stats.shortestWord : '—'}
                </span>
              </div>

              {showPlayerContributions && stats.playerContributions.length > 1 && (
                <div className="pt-2 border-t border-white/10">
                  <div className="text-white/40 text-xs mb-2">玩家贡献</div>
                  <div className="space-y-2">
                    {stats.playerContributions.map(p => (
                      <div key={p.authorId} className="flex items-center gap-2.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: p.authorColor }}
                        />
                        <span className="flex-1 text-white/80 truncate text-xs">{p.authorName}</span>
                        <span className="text-white/50 text-xs tabular-nums">{p.count}词</span>
                        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden shrink-0">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: p.authorColor }}
                            initial={{ width: 0 }}
                            animate={{ width: `${p.ratio}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-white/50 text-xs tabular-nums w-8 text-right">{p.ratio}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
