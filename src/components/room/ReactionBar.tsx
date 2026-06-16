import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Flame, Heart, Utensils, Cat, Leaf } from 'lucide-react';

interface EmojiCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  emojis: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'common',
    name: '常用',
    icon: <Flame className="w-4 h-4" />,
    emojis: ['🎉', '👏', '😂', '🔥', '❤️', '👍', '✨', '🌟', '💯', '🚀', '💪', '🎊', '👀', '🤯', '😭', '💀'],
  },
  {
    id: 'emotions',
    name: '情绪',
    icon: <Heart className="w-4 h-4" />,
    emojis: ['😊', '😂', '🤣', '😍', '🥰', '😘', '😜', '🤪', '😎', '🤓', '🥺', '😢', '😭', '😤', '🤬', '😱'],
  },
  {
    id: 'food',
    name: '食物',
    icon: <Utensils className="w-4 h-4" />,
    emojis: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🍕', '🍔', '🍟', '🌮', '🍜', '🍣', '🍩', '🍪', '☕'],
  },
  {
    id: 'animals',
    name: '动物',
    icon: <Cat className="w-4 h-4" />,
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄'],
  },
  {
    id: 'nature',
    name: '自然',
    icon: <Leaf className="w-4 h-4" />,
    emojis: ['🌸', '🌺', '🌻', '🌹', '🌷', '🌳', '🌲', '🌴', '🌵', '🌊', '☀️', '🌙', '⭐', '🌈', '❄️', '🔥'],
  },
];

interface FloatingReaction {
  id: number;
  emoji: string;
  fromName: string;
  x: number;
  start: number;
}

interface FlyingEmoji {
  id: number;
  emoji: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface ReactionBarProps {
  onSend: (emoji: string) => void;
  lastReaction?: { emoji: string; fromName: string; id: number } | null;
  disabled?: boolean;
}

export default function ReactionBar({ onSend, lastReaction, disabled = false }: ReactionBarProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('common');
  const [floating, setFloating] = useState<FloatingReaction[]>([]);
  const [flyingEmojis, setFlyingEmojis] = useState<FlyingEmoji[]>([]);
  const lastIdRef = useRef<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

  const currentCategory = EMOJI_CATEGORIES.find(c => c.id === activeCategory) || EMOJI_CATEGORIES[0];
  const quickEmojis = EMOJI_CATEGORIES[0].emojis.slice(0, 8);

  const calculateParabolicPath = useCallback((t: number, startX: number, startY: number, endX: number, endY: number) => {
    const x = startX + (endX - startX) * t;
    const peakHeight = Math.min(150, Math.abs(endY - startY) + 100);
    const y = startY + (endY - startY) * t - peakHeight * Math.sin(Math.PI * t);
    return { x, y };
  }, []);

  const handleEmojiClick = useCallback((emoji: string, event: React.MouseEvent) => {
    if (disabled) return;

    const buttonRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const startX = buttonRect.left + buttonRect.width / 2;
    const startY = buttonRect.top + buttonRect.height / 2;

    const wordChainDisplay = document.getElementById('onboarding-word-chain');
    let endX = startX;
    let endY = startY - 200;

    if (wordChainDisplay) {
      const displayRect = wordChainDisplay.getBoundingClientRect();
      endX = displayRect.left + displayRect.width / 2 + (Math.random() - 0.5) * 100;
      endY = displayRect.top + displayRect.height / 2 + (Math.random() - 0.5) * 60;
    }

    const flyingId = Date.now() + Math.random();
    setFlyingEmojis(prev => [...prev, {
      id: flyingId,
      emoji,
      startX,
      startY,
      endX,
      endY,
    }]);

    setTimeout(() => {
      setFlyingEmojis(prev => prev.filter(f => f.id !== flyingId));
    }, 800);

    onSend(emoji);
  }, [disabled, onSend]);

  const handleQuickEmojiClick = useCallback((emoji: string, event: React.MouseEvent) => {
    if (disabled) return;

    const buttonRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const startX = buttonRect.left + buttonRect.width / 2;
    const startY = buttonRect.top + buttonRect.height / 2;

    const wordChainDisplay = document.getElementById('onboarding-word-chain');
    let endX = startX;
    let endY = startY - 200;

    if (wordChainDisplay) {
      const displayRect = wordChainDisplay.getBoundingClientRect();
      endX = displayRect.left + displayRect.width / 2 + (Math.random() - 0.5) * 100;
      endY = displayRect.top + displayRect.height / 2 + (Math.random() - 0.5) * 60;
    }

    const flyingId = Date.now() + Math.random();
    setFlyingEmojis(prev => [...prev, {
      id: flyingId,
      emoji,
      startX,
      startY,
      endX,
      endY,
    }]);

    setTimeout(() => {
      setFlyingEmojis(prev => prev.filter(f => f.id !== flyingId));
    }, 800);

    onSend(emoji);
  }, [disabled, onSend]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
        <AnimatePresence>
          {flyingEmojis.map(flying => (
            <motion.div
              key={flying.id}
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: [1, 1, 0.8, 0], scale: [1, 1.3, 1.1, 0.5] }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              className="fixed pointer-events-none text-4xl md:text-5xl"
              style={{
                left: 0,
                top: 0,
                willChange: 'transform',
                filter: 'drop-shadow(0 8px 16px rgba(139, 92, 246, 0.5))',
              }}
            >
              <motion.div
                animate={{
                  transform: [
                    `translate(${flying.startX}px, ${flying.startY}px) translate(-50%, -50%)`,
                    `translate(${calculateParabolicPath(0.25, flying.startX, flying.startY, flying.endX, flying.endY).x}px, ${calculateParabolicPath(0.25, flying.startX, flying.startY, flying.endX, flying.endY).y}px) translate(-50%, -50%)`,
                    `translate(${calculateParabolicPath(0.5, flying.startX, flying.startY, flying.endX, flying.endY).x}px, ${calculateParabolicPath(0.5, flying.startX, flying.startY, flying.endX, flying.endY).y}px) translate(-50%, -50%)`,
                    `translate(${calculateParabolicPath(0.75, flying.startX, flying.startY, flying.endX, flying.endY).x}px, ${calculateParabolicPath(0.75, flying.startX, flying.startY, flying.endX, flying.endY).y}px) translate(-50%, -50%)`,
                    `translate(${flying.endX}px, ${flying.endY}px) translate(-50%, -50%)`,
                  ],
                }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
              >
                {flying.emoji}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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
            {quickEmojis.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={!disabled ? { scale: 1.2, y: -3 } : {}}
                whileTap={!disabled ? { scale: 0.85 } : {}}
                onClick={(e) => handleQuickEmojiClick(emoji, e)}
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
                ref={panelRef}
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 10 }}
                className="absolute right-0 bottom-full mb-2 z-30 glass-panel rounded-2xl border border-white/10 shadow-xl overflow-hidden"
              >
                <div className="flex border-b border-white/10 bg-white/5">
                  {EMOJI_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex-1 flex flex-col items-center gap-0.5 px-3 py-2.5 transition-all ${
                        activeCategory === category.id
                          ? 'bg-gradient-to-b from-purple-500/20 to-transparent text-white'
                          : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                      }`}
                    >
                      <span className={activeCategory === category.id ? 'text-purple-300' : ''}>
                        {category.icon}
                      </span>
                      <span className="text-[10px] md:text-xs font-medium">{category.name}</span>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-2.5"
                  >
                    <div className="grid grid-cols-4 gap-1.5 w-[240px]">
                      {currentCategory.emojis.map((emoji, i) => (
                        <motion.button
                          key={emoji + i}
                          whileHover={!disabled ? { scale: 1.25, y: -2 } : {}}
                          whileTap={!disabled ? { scale: 0.85 } : {}}
                          onClick={(e) => {
                            handleEmojiClick(emoji, e);
                            setOpen(false);
                          }}
                          disabled={disabled}
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl hover:bg-white/10 transition-all active:scale-90"
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
