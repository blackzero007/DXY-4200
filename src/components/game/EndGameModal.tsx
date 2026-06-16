import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Clock, Sparkles, RotateCcw, Home, Medal, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ChainWord, Player } from '@/types';
import { formatDuration } from '@/utils/helpers';

interface EndGameModalProps {
  open: boolean;
  chain: ChainWord[];
  startWord: string;
  startTime: number;
  mode: 'solo' | 'room' | 'daily';
  players?: Player[];
  onClose: () => void;
  onRestart: () => void;
}

export default function EndGameModal({
  open,
  chain,
  startWord,
  startTime,
  mode,
  players = [],
  onClose,
  onRestart,
}: EndGameModalProps) {
  const navigate = useNavigate();
  const [show, setShow] = useState(open);

  useEffect(() => {
    if (open) setShow(true);
  }, [open]);

  if (!show) return null;

  const wordCount = chain.length;
  const endTime = chain[chain.length - 1]?.timestamp || Date.now();
  const duration = endTime - startTime;
  const topPlayers = [...players].sort((a, b) => b.score - a.score).slice(0, 3);
  const authors = new Set(chain.filter(c => c.authorId !== 'system').map(c => c.authorId)).size;

  const medalColors = [
    'from-amber-300 to-amber-500',
    'from-slate-300 to-slate-400',
    'from-orange-400 to-orange-600',
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={() => {
            setShow(false);
            setTimeout(onClose, 300);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="w-full max-w-lg glass-panel rounded-[2rem] p-6 md:p-8 border-gradient overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-gradient-to-br from-purple-500/40 to-pink-500/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-52 h-52 rounded-full bg-gradient-to-br from-indigo-500/40 to-cyan-500/20 blur-3xl" />

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 15 }}
                className="flex items-center justify-center w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 shadow-glow-pink"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="font-display text-3xl md:text-4xl text-center mb-1">
                <span className="text-gradient-warm">
                  {mode === 'daily' ? '挑战完成！' : '接龙完成！'}
                </span>
              </h2>
              <p className="text-center text-white/60 text-sm md:text-base mb-6">
                {mode === 'daily'
                  ? `今日挑战成绩：${wordCount}个词`
                  : `你创造了一个${wordCount}词的脑洞词链`}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <Stat icon={<Zap className="w-4 h-4" />} label="词数" value={`${wordCount}`} />
                <Stat icon={<Clock className="w-4 h-4" />} label="耗时" value={formatDuration(duration)} />
                <Stat icon={<Sparkles className="w-4 h-4" />} label="起始" value={startWord.slice(0, 4)} />
                <Stat icon={<Medal className="w-4 h-4" />} label="参与" value={mode === 'solo' ? '1人' : `${authors}人`} />
              </div>

              <div className="glass-panel rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3 text-white/70 text-sm">
                  <Star className="w-4 h-4 text-amber-300" />
                  <span>{mode === 'solo' ? '你的战绩' : '玩家榜'}</span>
                </div>
                {mode === 'solo' ? (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-white/85">成功接词</span>
                    <span className="font-display text-2xl text-gradient">{wordCount - 1} 个</span>
                  </div>
                ) : topPlayers.length > 0 ? (
                  <div className="space-y-2">
                    {topPlayers.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.08 }}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br ${medalColors[i]} text-white`}
                            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                          >
                            {i + 1}
                          </span>
                          <span className="text-white/85 font-medium">{p.name}</span>
                        </div>
                        <span className="font-display text-xl text-gradient">{p.score}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white/50 text-sm py-2 text-center">暂无数据</div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  className="btn-secondary flex-1"
                  onClick={() => {
                    setShow(false);
                    setTimeout(() => navigate(mode === 'daily' ? '/challenge' : '/'), 200);
                  }}
                >
                  <Home className="w-4 h-4" />
                  {mode === 'daily' ? '返回挑战' : '回首页'}
                </button>
                <button className="btn-primary flex-1" onClick={onRestart}>
                  <RotateCcw className="w-4 h-4" />
                  {mode === 'daily' ? '再试一次' : '再来一局'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-panel rounded-2xl p-3 text-center border border-white/10"
    >
      <div className="flex items-center justify-center gap-1 text-purple-300 mb-1 text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-display text-lg md:text-xl text-white truncate">{value}</div>
    </motion.div>
  );
}
