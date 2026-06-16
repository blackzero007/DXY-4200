import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import AnimatedGradientBg from '@/components/shared/AnimatedGradientBg';
import FloatingParticles from '@/components/shared/FloatingParticles';
import RoomHeader from '@/components/room/RoomHeader';
import PlayerList from '@/components/room/PlayerList';
import WaitingRoom from '@/components/room/WaitingRoom';
import ReactionBar from '@/components/room/ReactionBar';
import WordChainDisplay from '@/components/game/WordChainDisplay';
import WordInputArea from '@/components/game/WordInputArea';
import EndGameModal from '@/components/game/EndGameModal';
import GameReplay from '@/components/game/GameReplay';
import ChainStatsPanel from '@/components/game/ChainStatsPanel';
import { useToast } from '@/components/toast';
import { useRoomStore } from '@/store/useRoomStore';
import { useBroadcastChannel } from '@/hooks/useBroadcastChannel';
import { copyToClipboard } from '@/utils/helpers';
import { playSuccessSound, playFailSound, playGameEndSound } from '@/utils/soundFeedback';

export default function RoomPage() {
  const { roomId = '' } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    room,
    localPlayerId,
    validationMessage,
    lastValidationValid,
    lastReaction,
    totalAttempts,
    syncRoomFromStorage,
    joinRoom,
    startGame,
    submitWord,
    passTurn,
    kickPlayer,
    sendReaction,
    endGame,
    clearValidation,
  } = useRoomStore();

  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState('');
  const [asWatcher, setAsWatcher] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const initRef = useRef(false);

  const { broadcast } = useBroadcastChannel(roomId, true);

  useEffect(() => {
    if (initRef.current || !roomId) return;
    initRef.current = true;

    const ok = syncRoomFromStorage(roomId);
    const savedName = (() => {
      try { return localStorage.getItem('wordchain_player_name') || ''; }
      catch { return ''; }
    })();

    if (!ok) {
      setNickname(savedName);
      setShowNicknameModal(true);
      return;
    }

    const currentRoom = useRoomStore.getState().room;
    if (currentRoom) {
      const localId = useRoomStore.getState().localPlayerId;
      const exists = currentRoom.players.some(p => p.id === localId);
      if (!exists) {
        setNickname(savedName);
        setShowNicknameModal(true);
      }
    }
  }, [roomId, syncRoomFromStorage]);

  useEffect(() => {
    if (room && room.status === 'ended' && room.chain.length > 1 && !showEnd) {
      playGameEndSound();
      setShowEnd(true);
    }
  }, [room?.status, room?.chain.length, showEnd]);

  const handleJoin = () => {
    const name = (nickname || '匿名玩家').trim();
    if (!name) return;
    const { success, message } = joinRoom(roomId, name, asWatcher);
    if (!success) {
      toast.error(message);
      navigate('/');
      return;
    }
    setShowNicknameModal(false);
    setTimeout(() => {
      const r = useRoomStore.getState().room;
      if (r) broadcast('join-room', { player: r.players.find(p => p.id === localPlayerId) });
    }, 50);
  };

  const handleStartGame = (customStartWord?: string) => {
    const ok = startGame(localPlayerId, customStartWord);
    if (ok) {
      setTimeout(() => broadcast('start-game'), 40);
    }
  };

  const chainKey = `${room?.chain.length || 0}-${room?.chain[(room?.chain.length || 1) - 1]?.id || 'init'}`;

  const handleSubmit = (word: string) => {
    const result = submitWord(localPlayerId, word);
    if (result.success) {
      playSuccessSound();
      toast.success(result.message);
      setTimeout(() => clearValidation(), 1600);
      setTimeout(() => broadcast('add-word'), 30);
    } else {
      playFailSound();
      toast.error(result.message);
    }
    return result;
  };

  const handlePass = () => {
    passTurn(localPlayerId);
    setTimeout(() => broadcast('pass-turn'), 30);
  };

  const handleKick = (targetId: string) => {
    const ok = kickPlayer(localPlayerId, targetId);
    if (ok) setTimeout(() => broadcast('kick-player'), 30);
  };

  const handleReaction = (emoji: string) => {
    sendReaction(localPlayerId, emoji);
    setTimeout(() => broadcast('reaction'), 20);
  };

  const handleEndGame = () => {
    const ok = endGame(localPlayerId);
    if (ok) setTimeout(() => broadcast('end-game'), 30);
  };

  const handleShare = async () => {
    const text = `我在「脑洞大开花式接词」开了个房间：${room?.name || ''}\n房间码：${roomId}\n快来一起接龙吧！`;
    if (navigator.share) {
      try {
        await navigator.share({ title: '脑洞接词邀请', text });
        return;
      } catch {
        // 用户取消分享，回退到复制
      }
    }
    await copyToClipboard(text);
  };

  const isOwner = room?.ownerId === localPlayerId;
  const currentTurnPlayer = room?.players.find(p => p.id === room.currentTurnPlayerId);
  const isMyTurn = room?.currentTurnPlayerId === localPlayerId;
  const isWatcher = room?.players.find(p => p.id === localPlayerId)?.role === 'watcher';

  const turnTimeLimit = room?.turnTimeLimit;
  const turnStartTime = room?.turnStartTime;
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [countdownProgress, setCountdownProgress] = useState(1);
  const hasAutoPassedRef = useRef(false);

  useEffect(() => {
    if (
      !room ||
      room.status !== 'playing' ||
      !turnTimeLimit ||
      !turnStartTime ||
      !room.currentTurnPlayerId
    ) {
      setCountdownSeconds(null);
      setCountdownProgress(1);
      hasAutoPassedRef.current = false;
      return;
    }

    hasAutoPassedRef.current = false;

    const tick = () => {
      const elapsed = (Date.now() - turnStartTime) / 1000;
      const remaining = Math.max(0, Math.ceil(turnTimeLimit - elapsed));
      const progress = Math.max(0, Math.min(1, (turnTimeLimit - elapsed) / turnTimeLimit));
      setCountdownSeconds(remaining);
      setCountdownProgress(progress);
    };

    tick();
    const interval = setInterval(tick, 200);

    return () => clearInterval(interval);
  }, [room?.status, room?.currentTurnPlayerId, turnTimeLimit, turnStartTime]);

  const handleAutoPass = useCallback(() => {
    if (hasAutoPassedRef.current) return;
    const state = useRoomStore.getState();
    const latestRoom = state.room;
    if (!latestRoom || latestRoom.status !== 'playing') return;
    if (latestRoom.currentTurnPlayerId !== state.localPlayerId) return;
    hasAutoPassedRef.current = true;
    passTurn(state.localPlayerId);
    setTimeout(() => broadcast('pass-turn'), 30);
  }, [passTurn, broadcast]);

  useEffect(() => {
    if (countdownSeconds === 0 && isMyTurn && room?.status === 'playing') {
      handleAutoPass();
    }
  }, [countdownSeconds, isMyTurn, room?.status, handleAutoPass]);

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
        <div className="mb-5 md:mb-7">
          <RoomHeader
            roomId={roomId}
            roomName={room?.name || '加载中…'}
            chainLength={room?.chain.length || 0}
            isOwner={isOwner}
            playerCount={room?.players.filter(p => p.isOnline).length || 0}
            onShare={handleShare}
            countdownSeconds={countdownSeconds}
            countdownProgress={countdownProgress}
            turnTimeLimit={turnTimeLimit}
          />
        </div>

        {!room ? (
          <div className="text-center py-20 text-white/60">
            <div className="inline-flex flex-col items-center gap-3">
              <span className="text-5xl animate-float">🚪</span>
              <span className="font-display text-2xl">正在进入房间…</span>
            </div>
          </div>
        ) : room.status === 'waiting' ? (
          <div className="flex flex-col lg:flex-row gap-5 md:gap-6">
            <div className="flex-1 flex items-center justify-center py-4">
              <WaitingRoom
                roomId={roomId}
                roomName={room.name}
                isOwner={isOwner}
                onStartGame={handleStartGame}
              />
            </div>
            <div className="w-full lg:w-80 shrink-0">
              <PlayerList
                players={room.players}
                currentTurnPlayerId={null}
                isOwner={isOwner}
                ownerId={room.ownerId}
                localPlayerId={localPlayerId}
                onKick={handleKick}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
            <div className="flex-1 flex flex-col gap-4 md:gap-6 min-w-0">
              <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/10">
                <WordChainDisplay chain={room.chain} />
              </div>

              {currentTurnPlayer && (
                <div className="flex items-center justify-between glass-panel rounded-2xl px-4 md:px-5 py-2.5 md:py-3 border border-white/10 text-sm md:text-base">
                  <div className="flex items-center gap-3">
                    <span className="text-white/60">当前回合</span>
                    <span className="flex items-center gap-2">
                      <motion.span
                        className={`inline-block w-2 h-2 rounded-full ${
                          isMyTurn ? 'bg-emerald-400' : 'bg-purple-400'
                        } animate-pulse-ring`}
                      />
                      <span
                        className={`font-display text-lg md:text-xl ${
                          isMyTurn ? 'text-emerald-300' : 'text-purple-200'
                        }`}
                      >
                        {currentTurnPlayer.name}
                        {isMyTurn && <span className="ml-1 text-amber-300">（你！）</span>}
                      </span>
                    </span>
                  </div>
                  {isOwner && (
                    <button
                      onClick={handleEndGame}
                      className="text-white/55 hover:text-rose-300 text-xs md:text-sm transition-colors"
                    >
                      结束游戏
                    </button>
                  )}
                </div>
              )}

              <div className="max-w-3xl mx-auto w-full">
                <WordInputArea
                  lastWord={room.currentWord || '—'}
                  onSubmit={handleSubmit}
                  validationMessage={validationMessage}
                  validationValid={lastValidationValid}
                  inputKey={chainKey}
                  disabled={isWatcher || room.status !== 'playing'}
                  isMyTurn={isMyTurn && !isWatcher && room.status === 'playing'}
                  onPass={handlePass}
                  canPass={isMyTurn && !isWatcher && room.status === 'playing'}
                  turnHint={
                    isWatcher
                      ? '👀 围观模式'
                      : !isMyTurn
                      ? '等待中…'
                      : undefined
                  }
                />
              </div>

              <div className="max-w-3xl mx-auto w-full">
                <ReactionBar
                  onSend={handleReaction}
                  lastReaction={lastReaction}
                  disabled={room.status !== 'playing'}
                />
              </div>
            </div>

            <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4 md:gap-5">
              <PlayerList
                players={room.players}
                currentTurnPlayerId={room.currentTurnPlayerId}
                isOwner={isOwner}
                ownerId={room.ownerId}
                localPlayerId={localPlayerId}
                onKick={handleKick}
              />

              <div className="glass-panel rounded-3xl p-5 border border-white/10">
                <h3 className="font-display text-lg text-white mb-3 flex items-center gap-2">
                  <span>🎯</span> 本场战况
                </h3>
                <div className="space-y-2.5 text-sm text-white/70">
                  <div className="flex justify-between">
                    <span className="text-white/40">词链长度</span>
                    <span className="font-display text-lg text-gradient">
                      {room.chain.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">起始词</span>
                    <span className="font-medium text-white/85 truncate max-w-[60%]">
                      {room.startWord}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">状态</span>
                    <span className={room.status === 'playing' ? 'text-emerald-300' : 'text-white/70'}>
                      {room.status === 'playing' ? '进行中 🎮' : room.status === 'ended' ? '已结束' : '等待'}
                    </span>
                  </div>
                </div>
              </div>

              <ChainStatsPanel chain={room.chain} showPlayerContributions />

              {isOwner && room.status === 'playing' && (
                <button
                  onClick={handleEndGame}
                  className="w-full glass-panel rounded-2xl py-3 text-white/70 hover:text-rose-300 hover:bg-rose-500/10 transition-all border border-white/10 text-sm"
                >
                  结束本局游戏
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showNicknameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="w-full max-w-md glass-panel rounded-3xl p-6 md:p-8 border-gradient"
            >
              <h2 className="font-display text-2xl md:text-3xl text-white mb-1">
                欢迎来到 <span className="text-gradient">{roomId}</span>
              </h2>
              <p className="text-white/55 text-sm mb-6">先取个名字再加入吧～</p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/70 mb-1.5 block">你的昵称</label>
                  <input
                    autoFocus
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="脑洞玩家"
                    className="input-base"
                    maxLength={12}
                  />
                </div>
                <label className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={asWatcher}
                    onChange={(e) => setAsWatcher(e.target.checked)}
                    className="w-4 h-4 accent-purple-500"
                  />
                  <div>
                    <div className="text-white/90 font-medium text-sm">以围观者身份加入</div>
                    <div className="text-white/50 text-xs">只看不玩，安静当观众 👀</div>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 mt-7">
                <button
                  className="btn-secondary flex-1"
                  onClick={() => navigate('/')}
                >
                  返回
                </button>
                <button
                  className="btn-primary flex-1"
                  onClick={handleJoin}
                  disabled={!nickname.trim()}
                >
                  加入房间
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <EndGameModal
        open={showEnd}
        chain={room?.chain || []}
        startWord={room?.startWord || ''}
        startTime={room?.createdAt || Date.now()}
        mode="room"
        players={room?.players || []}
        totalAttempts={totalAttempts}
        playerId={localPlayerId}
        onClose={() => {
          setShowEnd(false);
          navigate('/');
        }}
        onRestart={() => {
          setShowEnd(false);
          if (isOwner) {
            handleStartGame();
          }
        }}
        onReplay={() => setShowReplay(true)}
      />

      {showReplay && (
        <GameReplay
          chain={room?.chain || []}
          startWord={room?.startWord || ''}
          onClose={() => {
            setShowReplay(false);
            setShowEnd(true);
          }}
        />
      )}
    </motion.div>
  );
}
