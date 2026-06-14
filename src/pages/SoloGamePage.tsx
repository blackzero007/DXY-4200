import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Pause, Play, Home } from 'lucide-react';
import AnimatedGradientBg from '@/components/shared/AnimatedGradientBg';
import FloatingParticles from '@/components/shared/FloatingParticles';
import WordChainDisplay from '@/components/game/WordChainDisplay';
import WordInputArea from '@/components/game/WordInputArea';
import EndGameModal from '@/components/game/EndGameModal';
import Avatar from '@/components/shared/Avatar';
import { useSoloGameStore } from '@/store/useSoloGameStore';
import { formatDuration } from '@/utils/helpers';

export default function SoloGamePage() {
  const navigate = useNavigate();
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
    initGame,
    submitWord,
    endGame,
    restart,
    clearValidation,
  } = useSoloGameStore();

  const [elapsed, setElapsed] = useState(0);
  const [showEnd, setShowEnd] = useState(false);

  useEffect(() => {
    const savedName = (() => {
      try { return localStorage.getItem('wordchain_player_name') || '脑洞玩家'; }
      catch { return '脑洞玩家'; }
    })();
    initGame(undefined, savedName);
  }, [initGame]);

  useEffect(() => {
    if (status !== 'playing') return;
    const timer = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 500);
    return () => clearInterval(timer);
  }, [status, startTime]);

  useEffect(() => {
    if (status === 'ended' && chain.length > 1) {
      setShowEnd(true);
    }
  }, [status, chain.length]);

  const handleSubmit = (word: string) => {
    const result = submitWord(word);
    if (result.success) {
      setTimeout(() => clearValidation(), 1600);
    }
    return result;
  };

  const handleEndGame = () => {
    endGame();
  };

  const handleRestart = () => {
    setShowEnd(false);
    restart();
    setElapsed(0);
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
            onClick={() => navigate('/')}
            className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-2xl glass-panel hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>

          <div className="flex-1 glass-panel rounded-2xl px-3 md:px-5 py-2.5 md:py-3 flex items-center justify-between gap-3 border border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={playerName} size="sm" isOwner />
              <div className="min-w-0">
                <div className="font-medium text-sm md:text-base text-white truncate">
                  {playerName}
                </div>
                <div className="text-[11px] md:text-xs text-white/55">
                  单人模式 · 接词 <span className="text-purple-300 font-bold">{score}</span> 个
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
              </div>
            </div>
            <div className="glass-panel rounded-3xl p-5 border border-white/10">
              <h3 className="font-display text-lg text-white mb-3 flex items-center gap-2">
                <span>💡</span> 小贴士
              </h3>
              <ul className="space-y-2 text-sm text-white/65">
                <li>· 尾字+同音都算哦</li>
                <li>· 不限成语，越开脑洞越好</li>
                <li>· 挑战一下自己的词库吧！</li>
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
          />
        </motion.div>
      </div>

      <EndGameModal
        open={showEnd}
        chain={chain}
        startWord={startWord}
        startTime={startTime}
        mode="solo"
        onClose={() => {
          setShowEnd(false);
          navigate('/');
        }}
        onRestart={handleRestart}
      />
    </motion.div>
  );
}
