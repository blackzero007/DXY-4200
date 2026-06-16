import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Medal,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Crown,
  Star,
} from 'lucide-react';
import AnimatedGradientBg from '@/components/shared/AnimatedGradientBg';
import FloatingParticles from '@/components/shared/FloatingParticles';
import Avatar from '@/components/shared/Avatar';
import {
  getDailyChallengeData,
  getLast7Days,
  formatDateLabel,
  isToday,
  getPlayerName,
  type DailyChallengeData,
} from '@/utils/dailyChallenge';

export default function DailyChallengePage() {
  const navigate = useNavigate();
  const [selectedDayIndex, setSelectedDayIndex] = useState(6);
  const [playerName, setPlayerName] = useState('脑洞玩家');
  const [challengeData, setChallengeData] = useState<DailyChallengeData | null>(null);

  const last7Days = useMemo(() => getLast7Days(), []);
  const selectedDate = last7Days[selectedDayIndex];

  useEffect(() => {
    setPlayerName(getPlayerName());
  }, []);

  useEffect(() => {
    const data = getDailyChallengeData(selectedDate);
    setChallengeData(data);
  }, [selectedDate]);

  const handlePrevDay = () => {
    if (selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1);
    }
  };

  const handleNextDay = () => {
    if (selectedDayIndex < last7Days.length - 1) {
      setSelectedDayIndex(selectedDayIndex + 1);
    }
  };

  const handleStartChallenge = () => {
    navigate('/game/solo?mode=daily&difficulty=normal');
  };

  const sortedRecords = useMemo(() => {
    if (!challengeData) return [];
    return [...challengeData.records].sort((a, b) => b.score - a.score);
  }, [challengeData]);

  const playerRecord = useMemo(() => {
    if (!challengeData) return null;
    return challengeData.records.find((r) => r.playerName === playerName) || null;
  }, [challengeData, playerName]);

  const playerRank = useMemo(() => {
    if (!playerRecord || sortedRecords.length === 0) return -1;
    return sortedRecords.findIndex((r) => r.playerName === playerName) + 1;
  }, [playerRecord, sortedRecords, playerName]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 text-center text-white/50 text-sm font-medium">{rank}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen w-full"
    >
      <AnimatedGradientBg />
      <FloatingParticles count={40} />

      <div className="relative z-10 max-w-5xl mx-auto px-3 md:px-5 pt-4 md:pt-6 pb-8 md:pb-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between gap-3 mb-6 md:mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-2xl glass-panel hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>

          <div className="flex-1 text-center">
            <h1 className="font-display text-2xl md:text-3xl text-gradient flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              每日挑战
            </h1>
            <p className="text-white/50 text-sm mt-1">每天一个起始词，挑战你的接词极限</p>
          </div>

          <div className="w-10 h-10 md:w-11 md:h-11" />
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="glass-panel rounded-[2rem] p-5 md:p-7 border border-white/10 mb-6"
        >
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={handlePrevDay}
              disabled={selectedDayIndex === 0}
              className="w-9 h-9 rounded-xl glass-panel border border-white/10 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>

            <div className="flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-purple-300" />
              <span className="font-display text-lg text-white">
                {formatDateLabel(selectedDate)}
              </span>
              {isToday(selectedDate) && (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium">
                  今日
                </span>
              )}
            </div>

            <button
              onClick={handleNextDay}
              disabled={selectedDayIndex === last7Days.length - 1}
              className="w-9 h-9 rounded-xl glass-panel border border-white/10 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="flex gap-1.5 md:gap-2 justify-center mb-6">
            {last7Days.map((date, index) => (
              <button
                key={index}
                onClick={() => setSelectedDayIndex(index)}
                className={`px-2 md:px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
                  index === selectedDayIndex
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                {formatDateLabel(date)}
              </button>
            ))}
          </div>

          <div className="text-center mb-6">
            <p className="text-white/50 text-sm mb-2">当日起始词</p>
            <motion.div
              key={challengeData?.startWord}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="inline-block"
            >
              <span className="font-display text-4xl md:text-5xl text-gradient font-bold">
                {challengeData?.startWord || '加载中...'}
              </span>
            </motion.div>
          </div>

          {isToday(selectedDate) && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartChallenge}
              className="w-full py-3.5 md:py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-bold text-base md:text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
            >
              <Star className="w-5 h-5" />
              开始挑战
            </motion.button>
          )}

          {!isToday(selectedDate) && (
            <div className="text-center py-4 text-white/40 text-sm">
              历史挑战仅供查看，无法参与
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="glass-panel rounded-3xl p-5 border border-white/10"
          >
            <h3 className="font-display text-lg text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              最高记录
            </h3>
            {challengeData && challengeData.bestScore > 0 ? (
              <div className="flex items-center gap-4">
                <Avatar
                  name={challengeData.bestPlayer || '匿名'}
                  size="lg"
                  isOwner
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {challengeData.bestPlayer}
                  </p>
                  <p className="text-white/50 text-sm">最高分保持者</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl text-gradient font-bold">
                    {challengeData.bestScore}
                  </p>
                  <p className="text-white/40 text-xs">分</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-white/40">
                <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">暂无记录</p>
                <p className="text-xs mt-1">成为第一个挑战者吧！</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="glass-panel rounded-3xl p-5 border border-white/10"
          >
            <h3 className="font-display text-lg text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-400" />
              我的成绩
            </h3>
            {playerRecord ? (
              <div className="flex items-center gap-4">
                <Avatar name={playerName} size="lg" isOwner />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{playerName}</p>
                  <p className="text-white/50 text-sm">
                    排名第 <span className="text-purple-300 font-bold">{playerRank}</span> 名
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl text-gradient font-bold">
                    {playerRecord.score}
                  </p>
                  <p className="text-white/40 text-xs">分</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-white/40">
                <Star className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  {isToday(selectedDate) ? '今日还未挑战' : '当日未参与'}
                </p>
                {isToday(selectedDate) && (
                  <p className="text-xs mt-1">点击上方按钮开始挑战</p>
                )}
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass-panel rounded-[2rem] p-5 md:p-6 border border-white/10"
        >
          <h3 className="font-display text-lg text-white mb-4 flex items-center gap-2">
            <Medal className="w-5 h-5 text-rose-400" />
            排行榜
            <span className="ml-auto text-sm font-normal text-white/50">
              共 {sortedRecords.length} 人参与
            </span>
          </h3>

          {sortedRecords.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {sortedRecords.slice(0, 10).map((record, index) => (
                  <motion.div
                    key={record.playerName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    layout
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      record.playerName === playerName
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      {getRankIcon(index + 1)}
                    </div>

                    <Avatar name={record.playerName} size="md" />

                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium truncate ${
                          record.playerName === playerName
                            ? 'text-purple-300'
                            : 'text-white/90'
                        }`}
                      >
                        {record.playerName}
                        {record.playerName === playerName && (
                          <span className="ml-2 text-xs text-purple-400">(我)</span>
                        )}
                      </p>
                      <p className="text-white/40 text-xs">
                        词链长度: {record.chainLength} 个词
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-display text-xl text-gradient font-bold">
                        {record.score}
                      </p>
                      <p className="text-white/40 text-xs">分</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12 text-white/40">
              <Trophy className="w-16 h-16 mx-auto mb-3 opacity-20" />
              <p className="text-base">暂无排行榜数据</p>
              <p className="text-sm mt-1">
                {isToday(selectedDate) ? '快来成为今日首位挑战者！' : '当日无人参与'}
              </p>
            </div>
          )}
        </motion.div>

        <footer className="mt-8 text-center text-white/30 text-xs">
          <p>💫 每日挑战 · 每天刷新你的接词记录</p>
        </footer>
      </div>
    </motion.div>
  );
}
