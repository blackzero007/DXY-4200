import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile } from 'lucide-react';

const EMOJIS = ['🎉', '👏', '😂', '🔥', '🤯', '✨', '❤️', '😭', '🐒', '👍', '👀', '🌟'];

interface FloatingReaction {
  id: number;
  emoji: string;
  fromName: string;
  x: number;
  start: number;
}

interface ReactionBarProps {
  onSend: (emoji: string) => void;
  lastReaction?: { emoji: string; fromName: string; id: number } | null;
  disabled?: boolean;
}

export default function ReactionBar({ onSend, lastReaction, disabled = false }: ReactionBarProps) {
  const [open, setOpen] = useState(false);
  const [floating, setFloating] = useState<FloatingReaction[]>([]);
  const lastIdRef = useRef<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lastReaction || lastReaction.id === lastIdRef.current) return;
    lastIdRef.current = lastReaction.id;
    const containerWidth = containerRef.current?.clientWidth || 400;
    const x = 20 + Math.random() * Math.max(containerWidth - 80, 200);
    const newFloat: FloatingReaction = {
      id: Date.now() + Math.random(),
      emoji: lastReaction.emoji,
      fromName: lastReaction.fromName,
      x,
      start: Date.now(),
    };
    setFloating(list => [...list.slice(-12), newFloat]);
    setTimeout(() => {
      setFloating(list => list.filter(f => f.id !== newFloat.id));
    }, 2800);
  }, [lastReaction]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="pointer-events-none absolute inset-x-0 bottom-full mb-2 h-24 md:h-28 overflow-hidden">
        <AnimatePresence>
          {floating.map(f => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 20, scale: 0.4 }}
              animate={{
                opacity: [0, 1, 1, 0.6, 0],
                y: [10, -10, -40, -80, -110],
                scale: [0.4, 1.2, 1, 0.9, 0.7],
                x: [f.x, f.x + (Math.random() - 0.5) * 40],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.6, ease: 'easeOut' }}
              className="absolute bottom-0 flex flex-col items-center"
              style={{ left: f.x }}
            >
              <span className="text-3xl md:text-4xl" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}>
                {f.emoji}
              </span>
              {f.fromName && (
                <span className="text-[10px] md:text-xs text-white/60 mt-0.5 whitespace-nowrap">
                  {f.fromName}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="flex-1 overflow-x-auto hide-scrollbar">
          <div className="flex gap-1.5 md:gap-2 py-1 min-w-max">
            {EMOJIS.slice(0, 8).map((emoji, i) => (
              <motion.button
                key={emoji}
                whileHover={!disabled ? { scale: 1.2, y: -3 } : {}}
                whileTap={!disabled ? { scale: 0.85 } : {}}
                onClick={() => !disabled && onSend(emoji)}
                disabled={disabled}
                className={`shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-xl md:text-2xl transition-all ${
                  disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : 'glass-panel hover:bg-white/15 border border-white/10'
                }`}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            disabled={disabled}
            className={`shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all ${
              disabled
                ? 'opacity-40 cursor-not-allowed'
                : 'glass-panel hover:bg-white/15 border border-white/10 text-white/80 hover:text-white'
            }`}
          >
            <Smile className="w-4.5 h-4.5" />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 10 }}
                className="absolute right-0 bottom-full mb-2 z-30 glass-panel rounded-2xl p-2.5 border border-white/10 shadow-xl"
              >
                <div className="grid grid-cols-4 gap-1.5 max-w-[220px]">
                  {EMOJIS.map((e, i) => (
                    <motion.button
                      key={e + i}
                      whileHover={!disabled ? { scale: 1.25 } : {}}
                      whileTap={!disabled ? { scale: 0.85 } : {}}
                      onClick={() => {
                        if (!disabled) onSend(e);
                        setOpen(false);
                      }}
                      disabled={disabled}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl hover:bg-white/10 transition-all"
                    >
                      {e}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
