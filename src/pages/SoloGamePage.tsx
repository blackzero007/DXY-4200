import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Pause, Shield, Zap, Flame, Sparkles } from 'lucide-react';
import AnimatedGradientBg from '@/components/shared/AnimatedGradientBg';
import FloatingParticles from '@/components/shared/FloatingParticles';
import WordChainDisplay from '@/components/game/WordChainDisplay';
import WordInputArea from '@/components/game/WordInputArea';
import EndGameModal from '@/components/game/EndGameModal';
import Avatar from '@/components/shared/Avatar';
import { useToast } from '@/components/toast';
import { useSoloGameStore } from '@/store/useSoloGameStore';
import { formatDuration } from '@/utils/helpers';
import { playSuccessSound, playFailSound, playGameEndSound } from '@/utils/soundFeedback';
import { getStartWordForDate, saveChallengeRecord } from '@/utils/dailyChallenge';
import type { DifficultyLevel, ThemeType } from '@/types';
import { DIFFICULTY_CONFIGS, THEME_CONFIGS } from '@/types';

const DIFFICULTY_ICONS: Record<DifficultyLevel, typeof Shield> = {
  easy: Shield,
  normal: Zap,
  hard: Flame,
};

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  easy: 'from-emerald-400 to-teal-500',
  normal: 'from-amber-400 to-orange-500',
  hard: 'from-rose-500 to-red-500',
};

export default function SoloGamePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const {
    chain,
    currentWord,
    startWord,
    score,
    startTime,
    status,
    playerName,
    validationMessage,
    lastValidationValid,
    difficulty,
    theme,
    initGame,
    submitWord,
    endGame,
    restart,
    clearValidation,
  } = useSoloGameStore();

  const [elapsed, setElapsed] = useState(0);
  const [showEnd, setShowEnd] = useState(false);
  const isDailyMode = searchParams.get('mode') === 'daily';
  const savedRecordRef = useRef(false);

  useEffect(() => {
    const savedName = (() => {
      try { return localStorage.getItem('wordchain_player_name') || '脑洞玩家'; }
      catch { return '脑洞玩家'; }
    })();
    const urlDifficulty = searchParams.get('difficulty') as DifficultyLevel | null;
    const validLevels: DifficultyLevel[] = ['easy', 'normal', 'hard'];
    const difficultyLevel = validLevels.includes(urlDifficulty as DifficultyLevel)
      ? urlDifficulty as DifficultyLevel
      : 'normal';
    
    const validThemes: ThemeType[] = ['food', 'animal', 'movie', 'idiom', 'nature'];
    const urlTheme = searchParams.get('theme') as ThemeType | null;
    const themeParam = validThemes.includes(urlTheme as ThemeType) ? urlTheme : null;

    let startWord: string | undefined;
    if (isDailyMode) {
      startWord = getStartWordForDate(new Date());
    }
    initGame(startWord, savedName, difficultyLevel, themeParam);
    savedRecordRef.current = false;
  }, [initGame, searchParams, isDailyMode]);

  useEffect(() => {
    if (status !== 'playing') return;
    const timer = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 500);
    return () => clearInterval(timer);
  }, [status, startTime]);

  useEffect(() => {
    if (status === 'ended' && chain.length > 1) {
      playGameEndSound();
      setShowEnd(true);
      
      if (isDailyMode && !savedRecordRef.current) {
        savedRecordRef.current = true;
        saveChallengeRecord(new Date(), {
          playerName,
          score,
          chainLength: chain.length,
          timestamp: Date.now(),
        });
      }
    }
  }, [status, chain.length, isDailyMode, playerName, score]);

  const handleSubmit = (word: string) => {
    const result = submitWord(word);
    if (result.success) {
      playSuccessSound();
      toast.success(result.message);
      setTimeout(() => clearValidation(), 1600);
    } else {
      playFailSound();
      toast.error(result.message);
    }
    return result;
  };

  const handleEndGame = () => {
    endGame();
  };

  const handleRestart = () => {
    setShowEnd(false);
    if (isDailyMode) {
      const dailyStartWord = getStartWordForDate(new Date());
      initGame(dailyStartWord, playerName, difficulty.level, theme);
    } else {
      restart();
    }
    setElapsed(0);
    savedRecordRef.current = false;
  };

  const chainKey = `${chain.length}-${chain[chain.length - 1]?.id || 'init'}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen w-full"
    >
      <AnimatedGradientBg />
      <FloatingParticles count={28} />

      <div className="relative z-10 max-w-7xl mx-auto px-3 md:px-5 pt-4 md:pt-6 pb-6 md:pb-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between gap-3 mb-5 md:mb-7"
        >
          <button
            onClick={() => navigate(isDailyMode ? '/challenge' : '/')}
            className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-2xl glass-panel hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>

          <div className="flex-1 glass-panel rounded-2xl px-3 md:px-5 py-2.5 md:py-3 flex items-center justify-between gap-3 border border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={playerName} size="sm" isOwner />
              <div className="min-w-0">
                <div className="font-medium text-sm md:text-base text-white truncate flex items-center gap-2">
                  {playerName}
                  {isDailyMode && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white bg-gradient-to-r from-amber-400 to-orange-500">
                      <Sparkles className="w-3 h-3" />
                      每日挑战
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white bg-gradient-to-r ${DIFFICULTY_COLORS[difficulty.level]}`}
                  >
                    {(() => {
                      const Icon = DIFFICULTY_ICONS[difficulty.level];
                      return <Icon className="w-3 h-3" />;
                    })()}
                    {DIFFICULTY_CONFIGS[difficulty.level].label}
                  </span>
                  {theme && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white bg-gradient-to-r ${THEME_CONFIGS[theme].gradient}`}>
                      {THEME_CONFIGS[theme].emoji}
                      {THEME_CONFIGS[theme].label}
                    </span>
                  )}
                </div>
                <div className="text-[11px] md:text-xs text-white/55">
                  {isDailyMode ? '每日挑战' : '单人模式'} · 接词 <span className="text-purple-300 font-bold">{score}</span> 个
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 text-xs md:text-sm">
              <div className="text-white/60 flex items-center gap-1.5">
                <span className="text-white/40">用时</span>
                <span className="font-mono text-white/85">{formatDuration(elapsed)}</span>
              </div>
              <div className="text-white/60 flex items-center gap-1.5">
                <span className="text-white/40">词链</span>
                <span className="font-mono text-purple-300 font-bold">{chain.length}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (status === 'ended') return;
                handleEndGame();
              }}
              className="shrink-0 hidden md:flex w-10 h-10 md:w-11 md:h-11 rounded-2xl glass-panel hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
              title="结束游戏"
            >
              <Pause className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={handleRestart}
              className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-2xl glass-panel hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
              title="重新开始"
            >
              <RotateCcw className="w-4.5 h-4.5" />
            </button>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="lg:col-span-3 glass-panel rounded-[2rem] overflow-hidden border border-white/10 relative"
          >
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-10 lg:hidden">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span>用时</span>
                <span className="font-mono text-white/85">{formatDuration(elapsed)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span>词链</span>
                <span className="font-mono text-purple-300 font-bold">{chain.length}</span>
              </div>
            </div>
            <WordChainDisplay chain={chain} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            <div className="glass-panel rounded-3xl p-5 border border-white/10">
              <h3 className="font-display text-lg text-white mb-3 flex items-center gap-2">
                <span>🎯</span> 当前任务
              </h3>
              <div className="space-y-2.5 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <span className="text-white/40">上一词</span>
                  <span className="font-display text-base text-white">{currentWord || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40">词链</span>
                  <span className="font-display text-base text-gradient">
                    {chain.length} 个词
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40">得分</span>
                  <span className="font-display text-base text-amber-300">{score} 分</span>
                </div>
                {theme && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/40">主题</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-white bg-gradient-to-r ${THEME_CONFIGS[theme].gradient}`}>
                      {THEME_CONFIGS[theme].emoji}
                      {THEME_CONFIGS[theme].label}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="glass-panel rounded-3xl p-5 border border-white/10">
              <h3 className="font-display text-lg text-white mb-3 flex items-center gap-2">
                <span>🎮</span> 当前规则
              </h3>
              <ul className="space-y-2 text-sm text-white/65">
                <li className="flex items-start gap-2">
                  <span className="text-white/40">·</span>
                  <span>最少 <span className="font-bold text-white/85">{difficulty.minLength}</span> 个字</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40">·</span>
                  <span>{difficulty.allowHomophone ? '允许' : '禁止'}使用同音字</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40">·</span>
                  <span>{difficulty.containsMode === 'contains' ? '包含上词尾字即可' : '必须以上词尾字开头'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40">·</span>
                  <span>不限成语，越开脑洞越好</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="max-w-3xl mx-auto mt-6 md:mt-8"
        >
          <WordInputArea
            lastWord={currentWord || '系统初始化中'}
            onSubmit={handleSubmit}
            validationMessage={validationMessage}
            validationValid={lastValidationValid}
            inputKey={chainKey}
            allowHomophone={difficulty.allowHomophone}
          />
        </motion.div>
      </div>

      <EndGameModal
        open={showEnd}
        chain={chain}
        startWord={startWord}
        startTime={startTime}
        mode={isDailyMode ? 'daily' : 'solo'}
        onClose={() => {
          setShowEnd(false);
          navigate(isDailyMode ? '/challenge' : '/');
        }}
        onRestart={handleRestart}
      />
    </motion.div>
  );
}
