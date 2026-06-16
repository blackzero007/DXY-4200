import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, Gauge } from 'lucide-react';
import WordBlock from './WordBlock';
import ChainConnector from './ChainConnector';
import type { ChainWord } from '@/types';

interface GameReplayProps {
  chain: ChainWord[];
  startWord: string;
  onClose: () => void;
}

const SPEED_OPTIONS = [0.5, 1, 2, 5] as const;
const BASE_INTERVAL = 1200;

export default function GameReplay({ chain, startWord, onClose }: GameReplayProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<typeof SPEED_OPTIONS[number]>(1);
  const timerRef = useRef<number | null>(null);
  const displayChain = chain.slice(0, currentIndex + 1);
  const latestIndex = displayChain.length - 1;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const layout: 'horizontal' | 'vertical' = isMobile ? 'vertical' : 'horizontal';

  const playNext = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev >= chain.length - 1) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [chain.length]);

  useEffect(() => {
    if (currentIndex >= chain.length - 1 && isPlaying) {
      setIsPlaying(false);
      const timeout = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, chain.length, isPlaying, onClose]);

  useEffect(() => {
    if (isPlaying) {
      const interval = BASE_INTERVAL / speed;
      timerRef.current = window.setInterval(playNext, interval);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, speed, playNext]);

  const togglePlay = () => {
    if (currentIndex >= chain.length - 1) {
      setCurrentIndex(-1);
      setIsPlaying(true);
    } else {
      setIsPlaying(prev => !prev);
    }
  };

  const handleClose = () => {
    setIsPlaying(false);
    onClose();
  };

  const progress = chain.length > 0 ? ((currentIndex + 1) / chain.length) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col bg-ink-900"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-pink-600/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Gauge className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl text-white">游戏回放</h2>
              <p className="text-sm text-white/50">
                起始词：{startWord} · 共 {chain.length} 个词
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center overflow-auto custom-scrollbar px-4 md:px-8 py-8">
          {displayChain.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <span className="text-6xl animate-float">✨</span>
              <p className="mt-4 font-display text-xl text-white/60">准备开始回放…</p>
            </motion.div>
          ) : (
            <div
              className={`relative flex ${
                isMobile ? 'flex-col items-center' : 'items-center'
              } mx-auto`}
            >
              <AnimatePresence mode="popLayout">
                {displayChain.map((w, i) => (
                  <motion.div
                    key={w.id}
                    layout
                    className={`flex ${isMobile ? 'flex-col items-center' : 'items-center'}`}
                  >
                    <WordBlock
                      word={w}
                      isFirst={i === 0}
                      isLatest={i === latestIndex}
                      layout={layout}
                      index={i}
                    />
                    {i < displayChain.length - 1 && (
                      <ChainConnector
                        animated={i === latestIndex - 1}
                        layout={layout}
                        delay={i === latestIndex - 1 ? 0.35 : 0}
                        index={i}
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="relative z-10 border-t border-white/10 px-4 md:px-8 py-4 md:py-6 bg-black/30 backdrop-blur-md">
          <div className="h-1.5 bg-white/10 rounded-full mb-4 md:mb-6 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 md:gap-4">
              {SPEED_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-sm md:text-base font-medium transition-all ${
                    speed === s
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="text-sm md:text-base text-white/60 font-mono">
                {Math.max(0, currentIndex + 1)} / {chain.length}
              </div>
              <button
                onClick={togglePlay}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/40 hover:scale-105 active:scale-95 transition-transform"
              >
                {isPlaying && currentIndex < chain.length - 1 ? (
                  <Pause className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                  <Play className="w-5 h-5 md:w-6 md:h-6 ml-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
