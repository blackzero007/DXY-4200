import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, RefreshCw, Lightbulb } from 'lucide-react';
import { getLastChar, getHintWords } from '@/utils/wordDatabase';

interface WordInputAreaProps {
  lastWord: string;
  placeholder?: string;
  disabled?: boolean;
  isMyTurn?: boolean;
  onSubmit: (word: string) => { success: boolean; message: string };
  validationMessage: string;
  validationValid: boolean | null;
  onPass?: () => void;
  canPass?: boolean;
  inputKey?: string | number;
  turnHint?: string;
  allowHomophone?: boolean;
}

export default function WordInputArea({
  lastWord,
  placeholder = '输入一个词…',
  disabled = false,
  isMyTurn = true,
  onSubmit,
  validationMessage,
  validationValid,
  onPass,
  canPass = true,
  inputKey,
  turnHint,
  allowHomophone = true,
}: WordInputAreaProps) {
  const [value, setValue] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [hintWords, setHintWords] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const lastChar = getLastChar(lastWord);

  useEffect(() => {
    setValue('');
    setShowHints(false);
    setHintWords([]);
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
    if (isMyTurn && !disabled && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [inputKey, lastWord, isMyTurn, disabled]);

  useEffect(() => {
    if (validationValid === false && validationMessage) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 550);
    }
    if (validationValid === true && validationMessage) {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 800);
    }
  }, [validationValid, validationMessage]);

  useEffect(() => {
    return () => {
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
      }
    };
  }, []);

  const handleShowHints = () => {
    if (disabled || !isMyTurn) return;
    const hints = getHintWords(lastChar, 3, allowHomophone);
    if (hints.length === 0) return;
    setHintWords(hints);
    setShowHints(true);
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
    }
    hintTimerRef.current = setTimeout(() => {
      setShowHints(false);
      hintTimerRef.current = null;
    }, 5000);
  };

  const handleHintClick = (word: string) => {
    setValue(word);
    setShowHints(false);
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || !isMyTurn) return;
    const result = onSubmit(trimmed);
    if (result.success) {
      setValue('');
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm text-white/50">
            上一词
            <span className="font-display text-white/80 mx-1.5 text-base md:text-lg">
              {lastWord || '—'}
            </span>
          </span>
          {lastChar && (
            <motion.span
              key={lastChar}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-display text-sm md:text-base bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/40 text-white"
            >
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-300" />
              请用「<span className="text-amber-300 mx-0.5">{lastChar}</span>」开头（含同音）
            </motion.span>
          )}
        </div>
        {turnHint && (
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs md:text-sm text-purple-300 font-medium"
          >
            {turnHint}
          </motion.span>
        )}
      </div>

      <motion.div
        initial={false}
        animate={isShaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
        className={`relative rounded-3xl glass-panel p-2 transition-all duration-500 ${
          isPulsing ? 'shadow-glow-green ring-2 ring-emerald-400/60' : ''
        } ${isShaking ? 'shadow-glow-red ring-2 ring-rose-400/60' : ''} ${
          isMyTurn && !disabled ? 'ring-1 ring-purple-400/30' : ''
        }`}
      >
        <AnimatePresence>
          {showHints && hintWords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute -top-14 left-0 right-0 flex justify-center gap-2 md:gap-3 z-20 pointer-events-none"
            >
              {hintWords.map((word, index) => (
                <motion.button
                  key={`${word}-${index}`}
                  type="button"
                  onClick={() => handleHintClick(word)}
                  initial={{ opacity: 0, y: 20, scale: 0.6 }}
                  animate={{
                    opacity: 1,
                    y: [0, -8, 0],
                    scale: 1,
                  }}
                  exit={{ opacity: 0, y: -20, scale: 0.6 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 18,
                    delay: index * 0.08,
                    y: {
                      repeat: Infinity,
                      duration: 2.2 + index * 0.3,
                      ease: 'easeInOut',
                    },
                  }}
                  whileHover={{ scale: 1.12, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="pointer-events-auto shrink-0 px-3.5 md:px-4 py-2 md:py-2.5 rounded-full font-display text-sm md:text-base text-white bg-gradient-to-br from-amber-400 via-orange-400 to-pink-500 shadow-lg shadow-orange-500/30 border border-white/30 hover:shadow-orange-500/50 transition-shadow"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-white/90" />
                    {word}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
              placeholder={isMyTurn ? placeholder : '等待其他玩家…'}
              disabled={disabled || !isMyTurn}
              className="w-full bg-transparent outline-none text-white placeholder-white/35 text-base md:text-xl py-3 md:py-3.5 px-4 md:px-5 rounded-2xl disabled:cursor-not-allowed"
              maxLength={20}
            />
            {value.length > 0 && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/40">
                {value.length}/20
              </span>
            )}
          </div>
          {isMyTurn && !disabled && (
            <motion.button
              type="button"
              onClick={handleShowHints}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="shrink-0 px-3 md:px-4 py-2.5 md:py-3 rounded-2xl text-amber-300 hover:text-amber-200 border border-amber-400/30 hover:border-amber-400/50 hover:bg-amber-400/10 transition-all text-sm md:text-base flex items-center gap-1.5"
              title="智能提示"
            >
              <Lightbulb className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">提示</span>
            </motion.button>
          )}
          {canPass && onPass && isMyTurn && !disabled && (
            <button
              type="button"
              onClick={onPass}
              disabled={!canPass}
              className="shrink-0 px-3 md:px-4 py-2.5 md:py-3 rounded-2xl text-white/70 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all disabled:opacity-50 text-sm md:text-base flex items-center gap-1.5"
              title="跳过这一轮"
            >
              <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">跳过</span>
            </button>
          )}
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || !isMyTurn || value.trim().length === 0}
            whileHover={!disabled && isMyTurn && value.trim() ? { scale: 1.06 } : {}}
            whileTap={!disabled && isMyTurn ? { scale: 0.94 } : {}}
            className="shrink-0 btn-primary !px-4 md:!px-6 !py-2.5 md:!py-3 gap-2"
          >
            <span className="hidden sm:inline">提交</span>
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
