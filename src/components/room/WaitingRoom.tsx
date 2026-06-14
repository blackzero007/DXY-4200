import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, Shuffle, Loader2 } from 'lucide-react';
import Avatar from '@/components/shared/Avatar';
import FloatingParticles from '@/components/shared/FloatingParticles';
import { START_WORDS, getRandomStartWord } from '@/utils/wordDatabase';

interface WaitingRoomProps {
  roomId: string;
  roomName: string;
  isOwner: boolean;
  onStartGame: (startWord: string) => void;
  isStarting?: boolean;
}

export default function WaitingRoom({
  roomId,
  roomName,
  isOwner,
  onStartGame,
  isStarting = false,
}: WaitingRoomProps) {
  const [customWord, setCustomWord] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  const suggestedWords = [
    ...START_WORDS.slice(0, 5),
    getRandomStartWord(),
    getRandomStartWord(),
    getRandomStartWord(),
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 8);

  const handleShuffle = () => {
    setIsShuffling(true);
    setSelectedPreset(null);
    setCustomWord('');
    setTimeout(() => setIsShuffling(false), 500);
  };

  const getStartWord = () => {
    if (customWord.trim()) return customWord.trim();
    if (selectedPreset) return selectedPreset;
    return getRandomStartWord();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto glass-panel rounded-[2rem] p-6 md:p-10 border-gradient overflow-hidden">
      <FloatingParticles count={22} />

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
            className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-4 shadow-glow-purple"
          >
            <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </motion.div>
          <h2 className="font-display text-3xl md:text-4xl text-white mb-2">
            <span className="text-gradient">等待室</span>
          </h2>
          <p className="text-white/60 text-sm md:text-base">
            {isOwner ? '选择起始词，准备开启脑洞接龙！' : '等待房主开始游戏…'}
          </p>
        </motion.div>

        {isOwner ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-6"
          >
            <div className="glass-panel rounded-2xl p-4 md:p-5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-white/80">
                  <span className="font-medium">选择起始词</span>
                  <span className="text-xs text-white/40">(留空则系统随机)</span>
                </div>
                <button
                  onClick={handleShuffle}
                  className="text-white/60 hover:text-white transition-colors"
                  title="换一批"
                >
                  <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <input
                type="text"
                value={customWord}
                onChange={(e) => {
                  setCustomWord(e.target.value);
                  setSelectedPreset(null);
                }}
                placeholder="也可以自己输入一个起始词…"
                className="input-base mb-4"
                maxLength={10}
              />
              <div className="flex flex-wrap gap-2">
                {suggestedWords.map((w, i) => (
                  <motion.button
                    key={w}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 + i * 0.04 }}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedPreset(selectedPreset === w ? null : w);
                      setCustomWord('');
                    }}
                    className={`px-3.5 py-2 rounded-2xl font-display text-sm md:text-base transition-all ${
                      selectedPreset === w
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-glow-purple ring-2 ring-white/60'
                        : 'glass-panel text-white/85 hover:text-white border border-white/10'
                    }`}
                  >
                    {w}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <div className="text-sm text-white/55 mb-2">即将使用的起始词：</div>
              <div className="flex items-center justify-center py-4">
                <motion.span
                  key={getStartWord()}
                  initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  className="font-display text-3xl md:text-4xl text-gradient"
                >
                  {getStartWord()}
                </motion.span>
              </div>
            </div>

            <button
              disabled={isStarting}
              onClick={() => onStartGame(getStartWord())}
              className="btn-primary w-full !py-4 !text-xl"
            >
              {isStarting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {isStarting ? '游戏开始中…' : '开始接龙游戏'}
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-8"
          >
            <div className="inline-flex items-center gap-3 glass-panel rounded-2xl px-5 py-3 mb-8 border border-white/10">
              <div className="flex -space-x-2">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-ink-900 animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <span className="text-white/70 text-sm md:text-base">
                房主正在准备游戏…
              </span>
            </div>
            <div className="max-w-md mx-auto text-left glass-panel rounded-2xl p-5 border border-white/10">
              <div className="text-white/80 font-medium mb-3 flex items-center gap-2">
                <span>🎯</span> 小贴士
              </div>
              <ul className="space-y-2 text-white/60 text-sm md:text-base">
                <li>· 以前一词的尾字（或同音字）开头接词</li>
                <li>· 不限于成语，词汇/短语/梗都可以</li>
                <li>· 脑洞越大，得分越高（越有趣越棒！）</li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
