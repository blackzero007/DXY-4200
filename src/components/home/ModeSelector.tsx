import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, Zap, ArrowRight, LogIn, Sparkles } from 'lucide-react';
import { useToast } from '@/components/toast';
import { useRoomStore } from '@/store/useRoomStore';
import DifficultySelector from '@/components/shared/DifficultySelector';
import type { DifficultyConfig, DifficultyLevel } from '@/types';

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (nickname: string, roomName: string) => void;
}

function CreateModal({ open, onClose, onSubmit }: CreateModalProps) {
  const [nickname, setNickname] = useState('');
  const [roomName, setRoomName] = useState('');
  const name = useRoomStore(s => s.localPlayerName);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-md glass-panel rounded-3xl p-6 md:p-8 border-gradient"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display text-2xl text-white">创建房间</h3>
                <p className="text-xs text-white/50">邀请朋友一起来接词吧！</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70 mb-1.5 block">你的昵称</label>
                <input
                  autoFocus
                  type="text"
                  value={nickname || name}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="给自己取个脑洞名字"
                  className="input-base"
                  maxLength={12}
                />
              </div>
              <div>
                <label className="text-sm text-white/70 mb-1.5 block">房间名称（可选）</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="我的脑洞房间"
                  className="input-base"
                  maxLength={20}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-7">
              <button className="btn-secondary flex-1" onClick={onClose}>
                取消
              </button>
              <button
                className="btn-primary flex-1"
                onClick={() => {
                  const n = (nickname || name || '玩家').trim();
                  if (!n) return;
                  onSubmit(n, roomName.trim());
                }}
              >
                创建并进入
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface JoinModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (roomCode: string, nickname: string, asWatcher: boolean) => void;
}

function JoinModal({ open, onClose, onSubmit }: JoinModalProps) {
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [asWatcher, setAsWatcher] = useState(false);
  const name = useRoomStore(s => s.localPlayerName);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-md glass-panel rounded-3xl p-6 md:p-8 border-gradient"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <LogIn className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display text-2xl text-white">加入房间</h3>
                <p className="text-xs text-white/50">输入房间码开启你的脑洞之旅</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70 mb-1.5 block">房间码</label>
                <input
                  autoFocus
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="请输入6位房间码"
                  className="input-base tracking-[0.3em] font-mono text-center text-xl"
                  maxLength={6}
                />
              </div>
              <div>
                <label className="text-sm text-white/70 mb-1.5 block">你的昵称</label>
                <input
                  type="text"
                  value={nickname || name}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="给自己取个脑洞名字"
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
              <button className="btn-secondary flex-1" onClick={onClose}>
                取消
              </button>
              <button
                className="btn-primary flex-1"
                onClick={() => {
                  const code = roomCode.trim();
                  const n = (nickname || name || '玩家').trim();
                  if (code.length !== 6 || !n) return;
                  onSubmit(code, n, asWatcher);
                }}
              >
                加入房间
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ModeSelector() {
  const navigate = useNavigate();
  const { createRoom, joinRoom } = useRoomStore();
  const toast = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const [soloName, setSoloName] = useState('');
  const [showSolo, setShowSolo] = useState(false);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const storedName = useRoomStore(s => s.localPlayerName);

  const startSoloWithDifficulty = (name: string, difficulty: DifficultyLevel) => {
    try { localStorage.setItem('wordchain_player_name', name); } catch { /* ignore */ }
    navigate(`/game/solo?difficulty=${difficulty}`);
  };

  const modes = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: '单人畅玩',
      desc: '快速开始，放飞想象',
      tag: '无压力',
      gradient: 'from-amber-400 via-orange-500 to-pink-500',
      onClick: () => setShowSolo(true),
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: '创建房间',
      desc: '成为房主，邀请好友接龙',
      tag: '社交首选',
      gradient: 'from-indigo-500 via-purple-500 to-fuchsia-500',
      onClick: () => setShowCreate(true),
    },
    {
      icon: <UserPlus className="w-6 h-6" />,
      title: '加入房间',
      desc: '输入房间码，加入战局',
      tag: '有码速来',
      gradient: 'from-teal-400 via-cyan-500 to-indigo-500',
      onClick: () => setShowJoin(true),
    },
  ];

  return (
    <section className="w-full px-4 py-6 md:py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {modes.map((m, i) => (
          <motion.button
            key={m.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={m.onClick}
            className="card-float text-left p-6 md:p-7 group relative overflow-hidden"
          >
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${m.gradient}`}
            />
            <div className="relative z-10">
              <div
                className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl mb-5 flex items-center justify-center text-white bg-gradient-to-br ${m.gradient}`}
                style={{ boxShadow: '0 10px 30px rgba(99, 102, 241, 0.35)' }}
              >
                {m.icon}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-display text-2xl md:text-3xl text-white">{m.title}</h3>
                <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/65 border border-white/10">
                  {m.tag}
                </span>
              </div>
              <p className="text-white/55 text-sm md:text-base mb-5">{m.desc}</p>
              <div className="flex items-center gap-2 text-white/80 font-medium group-hover:text-white transition-colors">
                <span>立即开始</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <CreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={(nickname, roomName) => {
          const { roomId } = createRoom(nickname, roomName);
          navigate(`/room/${roomId}`);
        }}
      />

      <JoinModal
        open={showJoin}
        onClose={() => setShowJoin(false)}
        onSubmit={(code, nickname, asWatcher) => {
          const { success, message } = joinRoom(code, nickname, asWatcher);
          if (success) {
            navigate(`/room/${code}`);
          } else {
            toast.error(message);
          }
        }}
      />

      <AnimatePresence>
        {showSolo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSolo(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-md glass-panel rounded-3xl p-6 md:p-8 border-gradient"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-white">单人畅玩</h3>
                  <p className="text-xs text-white/50">随时开始，无需等待</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-white/70 mb-1.5 block">你的昵称</label>
                <input
                  autoFocus
                  type="text"
                  value={soloName || storedName}
                  onChange={(e) => setSoloName(e.target.value)}
                  placeholder="给自己取个脑洞名字"
                  className="input-base"
                  maxLength={12}
                />
              </div>
              <div className="flex gap-3 mt-7">
                <button className="btn-secondary flex-1" onClick={() => setShowSolo(false)}>
                  取消
                </button>
                <button
                  className="btn-primary flex-1"
                  onClick={() => {
                    const n = (soloName || storedName || '脑洞玩家').trim();
                    if (!n) return;
                    setSoloName(n);
                    setShowSolo(false);
                    setShowDifficulty(true);
                  }}
                >
                  开始接龙
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DifficultySelector
        open={showDifficulty}
        onClose={() => setShowDifficulty(false)}
        onSelect={(config: DifficultyConfig) => {
          const n = soloName || storedName || '脑洞玩家';
          startSoloWithDifficulty(n.trim(), config.level);
          setShowDifficulty(false);
        }}
      />
    </section>
  );
}
