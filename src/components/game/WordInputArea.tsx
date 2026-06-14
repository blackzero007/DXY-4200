import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, RefreshCw, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { getLastChar } from '@/utils/wordDatabase';

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
}: WordInputAreaProps) {
  const [value, setValue] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const lastChar = getLastChar(lastWord);

  useEffect(() => {
    setValue('');
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

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || !isMyTurn) return;
    const result = onSubmit(trimmed);
    if (result.success) {
      setValue('');
    }
  };

  const showValidation = validationMessage && validationValid !== null;

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

        <AnimatePresence>
          {showValidation && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-2xl mt-2 ${
                validationValid
                  ? 'bg-emerald-500/10 border border-emerald-400/25'
                  : 'bg-rose-500/10 border border-rose-400/25'
              }`}
            >
              {validationValid ? (
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 md:w-5 md:h-5 text-rose-400 shrink-0" />
              )}
              <span
                className={`text-sm md:text-base font-medium ${
                  validationValid ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {validationMessage}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
