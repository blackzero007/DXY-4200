import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Users, Share2, Check, LogOut } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import { copyToClipboard } from '@/utils/helpers';
import FloatingParticles from '@/components/shared/FloatingParticles';

interface RoomHeaderProps {
  roomId: string;
  roomName: string;
  chainLength: number;
  isOwner: boolean;
  playerCount: number;
  onShare?: () => void;
}

export default function RoomHeader({
  roomId,
  roomName,
  chainLength,
  isOwner,
  playerCount,
  onShare,
}: RoomHeaderProps) {
  const navigate = useNavigate();
  const { cleanupRoom, localPlayerId } = useRoomStore();
  const [copied, setCopied] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(roomId);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleLeave = () => {
    cleanupRoom();
    navigate('/');
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full"
      >
        <div className="glass-panel rounded-3xl px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-5">
          <button
            className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-2xl glass-panel hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all"
            onClick={() => setShowLeaveConfirm(true)}
            title="离开房间"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-display text-lg md:text-xl text-white truncate">
                {roomName}
              </h2>
              {isOwner && (
                <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-400/30">
                  👑 房主
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs md:text-sm text-white/55">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {playerCount} 人在线
              </span>
              {chainLength > 0 && (
                <span>已接 {chainLength} 词</span>
              )}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-2xl glass-panel border border-white/10">
            <span className="text-xs md:text-sm text-white/55">房间码</span>
            <span className="font-mono font-bold tracking-widest text-white text-base md:text-lg">
              {roomId}
            </span>
            <button
              onClick={handleCopy}
              className={`w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center transition-all ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'hover:bg-white/10 text-white/70 hover:text-white'
              }`}
              title="复制房间码"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Check className="w-4 h-4" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Copy className="w-4 h-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {onShare && (
            <button
              onClick={onShare}
              className="hidden md:flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-2xl glass-panel hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all text-sm"
            >
              <Share2 className="w-4 h-4" />
              邀请
            </button>
          )}

          <button
            onClick={handleCopy}
            className="sm:hidden shrink-0 w-10 h-10 rounded-2xl glass-panel flex items-center justify-center text-white/80 border border-white/10"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {showLeaveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowLeaveConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="w-full max-w-sm glass-panel rounded-3xl p-6 md:p-7 border-gradient relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <FloatingParticles count={14} className="opacity-60" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-4 shadow-glow-red">
                  <LogOut className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-2xl text-white mb-1">确认离开？</h3>
                <p className="text-white/55 text-sm mb-6">
                  {isOwner
                    ? '你是房主，离开后房间可能无法继续游戏哦～'
                    : '下次可以通过房间码再次加入'}
                </p>
                <div className="flex gap-3">
                  <button className="btn-secondary flex-1" onClick={() => setShowLeaveConfirm(false)}>
                    再想想
                  </button>
                  <button
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-glow-red hover:scale-105 transition-all active:scale-95"
                    onClick={handleLeave}
                  >
                    <LogOut className="w-4 h-4" />
                    确定离开
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
