import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, ArrowRight, Zap, Flame, Shield } from 'lucide-react';
import type { DifficultyLevel, DifficultyConfig } from '@/types';
import { DIFFICULTY_CONFIGS } from '@/types';

interface DifficultySelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (config: DifficultyConfig) => void;
  defaultLevel?: DifficultyLevel;
}

const LEVEL_ICONS: Record<DifficultyLevel, typeof Zap> = {
  easy: Shield,
  normal: Zap,
  hard: Flame,
};

const LEVEL_GRADIENTS: Record<DifficultyLevel, string> = {
  easy: 'from-emerald-400 via-teal-500 to-cyan-500',
  normal: 'from-amber-400 via-orange-500 to-pink-500',
  hard: 'from-rose-500 via-red-500 to-orange-500',
};

export default function DifficultySelector({
  open,
  onClose,
  onSelect,
  defaultLevel = 'normal',
}: DifficultySelectorProps) {
  const levels: DifficultyLevel[] = ['easy', 'normal', 'hard'];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-lg glass-panel rounded-3xl p-6 md:p-8 border-gradient"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display text-2xl text-white">选择难度</h3>
                <p className="text-xs text-white/50">挑一个适合你的挑战吧</p>
              </div>
            </div>

            <div className="space-y-3">
              {levels.map((level, index) => {
                const config = DIFFICULTY_CONFIGS[level];
                const Icon = LEVEL_ICONS[level];
                const isSelected = level === defaultLevel;
                return (
                  <motion.button
                    key={level}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08, type: 'spring', stiffness: 300 }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(config)}
                    className={`w-full text-left p-4 md:p-5 rounded-2xl border transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'bg-white/10 border-white/30 ring-2 ring-white/40'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity bg-gradient-to-br ${LEVEL_GRADIENTS[level]}`}
                    />
                    <div className="relative z-10 flex items-center gap-4">
                      <div
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white shrink-0 bg-gradient-to-br ${LEVEL_GRADIENTS[level]}`}
                        style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
                      >
                        <Icon className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display text-xl text-white">{config.label}</span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white/80 border border-white/20">
                              <Check className="w-3 h-3" />
                              默认
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/55">{config.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors shrink-0" />
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <button
              onClick={onClose}
              className="btn-secondary w-full mt-6"
            >
              取消
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
