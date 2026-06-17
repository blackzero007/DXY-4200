import { motion } from 'framer-motion';
import { getLastChar, getFirstChar } from '@/utils/wordDatabase';
import type { ChainWord } from '@/types';

interface WordBlockProps {
  word: ChainWord;
  isLatest?: boolean;
  isFirst?: boolean;
  layout?: 'horizontal' | 'vertical';
  index?: number;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  searchQuery?: string;
}

const COLOR_PALETTE = [
  'from-indigo-500 via-purple-500 to-fuchsia-500',
  'from-fuchsia-500 via-pink-500 to-rose-500',
  'from-amber-400 via-orange-500 to-red-500',
  'from-teal-400 via-cyan-500 to-indigo-500',
  'from-emerald-400 via-teal-500 to-cyan-500',
  'from-violet-500 via-purple-500 to-indigo-500',
  'from-rose-400 via-pink-500 to-fuchsia-500',
  'from-sky-400 via-blue-500 to-indigo-500',
];

export default function WordBlock({
  word,
  isLatest = false,
  isFirst = false,
  layout = 'horizontal',
  index = 0,
  isHighlighted = false,
  isDimmed = false,
  searchQuery = '',
}: WordBlockProps) {
  const chars = word.word.split('');
  const lastChar = getLastChar(word.word);
  const firstChar = getFirstChar(word.word);
  const query = searchQuery.toLowerCase();
  const wordLower = word.word.toLowerCase();
  const matchStart = query ? wordLower.indexOf(query) : -1;
  const matchEnd = matchStart >= 0 ? matchStart + query.length : -1;
  const gradientClass =
    word.authorColor && word.authorColor.startsWith('from-')
      ? word.authorColor
      : COLOR_PALETTE[index % COLOR_PALETTE.length];

  const bgGradient = word.authorId === 'system'
    ? 'from-slate-600 via-indigo-700 to-purple-800'
    : gradientClass;

  return (
    <motion.div
      layout
      initial={isLatest ? { opacity: 0, scale: 0.4, x: 60, y: 20 } : false}
      animate={isLatest ? { opacity: 1, scale: 1, x: 0, y: 0 } : {}}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={
        isLatest
          ? { duration: 0.55, type: 'spring', stiffness: 260, damping: 18 }
          : { duration: 0.3 }
      }
      className={`relative group ${isDimmed ? 'opacity-40' : ''}`}
      whileHover={isDimmed ? {} : { scale: 1.06, y: -4 }}
    >
      {isLatest && (
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.9, 1.25, 1.3] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
          className={`absolute inset-0 rounded-3xl pointer-events-none`}
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
          }}
        />
      )}

      <div
        className={`relative chain-word-shadow rounded-3xl px-5 py-4 md:px-7 md:py-5 bg-gradient-to-br ${bgGradient} overflow-hidden ${
          isHighlighted ? 'ring-4 ring-yellow-300 ring-opacity-90 shadow-[0_0_30px_rgba(253,224,71,0.5)]' : ''
        }`}
        style={{
          minWidth: layout === 'horizontal' ? '120px' : 'auto',
        }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              'linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.4) 50%, transparent 80%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2.5s linear infinite',
          }}
        />
        <div
          className="absolute top-1 left-1 right-1 h-[2px] rounded-full opacity-50"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
          }}
        />
        <div className="relative flex flex-wrap items-center justify-center gap-0.5 md:gap-1">
          {chars.map((ch, i) => {
            const isStartChar = i === 0;
            const isEndChar = i === chars.length - 1;
            const isInSearchMatch = matchStart >= 0 && i >= matchStart && i < matchEnd;
            return (
              <motion.span
                key={i}
                initial={isLatest ? { opacity: 0, y: 10, rotateX: -80 } : false}
                animate={isLatest ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                transition={{ delay: 0.18 + i * 0.06, duration: 0.35, type: 'spring' }}
                className={`font-display text-2xl md:text-4xl text-white inline-block ${
                  (isStartChar && !isFirst)
                    ? 'ring-2 ring-white/60 rounded-lg px-1.5 md:px-2 bg-white/15'
                    : ''
                } ${
                  (isEndChar && !isLatest)
                    ? 'text-amber-200'
                    : isEndChar && isLatest
                    ? 'text-yellow-100 animate-bounce-soft'
                    : ''
                } ${
                  isInSearchMatch
                    ? 'bg-yellow-300/80 text-ink-900 rounded-md px-0.5 md:px-1 -mx-0.5'
                    : ''
                }`}
                style={{
                  textShadow: isInSearchMatch ? 'none' : '0 2px 8px rgba(0,0,0,0.35)',
                  letterSpacing: '0.03em',
                }}
              >
                {ch}
                {isEndChar && !isFirst && (
                  <span className="block text-[10px] md:text-xs mt-1 text-amber-100/80 font-sans font-normal -mb-1">
                    尾「{lastChar}」
                  </span>
                )}
                {isStartChar && isFirst && (
                  <span className="block text-[10px] md:text-xs mt-1 text-white/80 font-sans font-normal -mb-1">
                    头「{firstChar}」
                  </span>
                )}
              </motion.span>
            );
          })}
        </div>
        {word.authorName && (
          <motion.div
            initial={isLatest ? { opacity: 0 } : false}
            animate={isLatest ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="relative mt-2 pt-2 border-t border-white/15 text-center"
          >
            <span className="text-[10px] md:text-xs text-white/70 font-medium">
              {word.authorId === 'system' ? '✨ 系统起词' : `🎤 ${word.authorName}`}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
