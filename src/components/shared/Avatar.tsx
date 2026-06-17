import { motion } from 'framer-motion';
import { getInitials } from '@/utils/helpers';
import { Crown, Eye } from 'lucide-react';

interface AvatarProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOwner?: boolean;
  isWatcher?: boolean;
  isOnline?: boolean;
  isCurrentTurn?: boolean;
  showCrown?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { w: 'w-7 h-7', text: 'text-xs', crown: 'w-3 h-3', ringOffset: 2, ringWidth: 2 },
  md: { w: 'w-10 h-10', text: 'text-sm', crown: 'w-4 h-4', ringOffset: 3, ringWidth: 3 },
  lg: { w: 'w-14 h-14', text: 'text-lg', crown: 'w-5 h-5', ringOffset: 4, ringWidth: 3 },
  xl: { w: 'w-20 h-20', text: 'text-2xl', crown: 'w-7 h-7', ringOffset: 5, ringWidth: 4 },
};

export default function Avatar({
  name,
  color = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  size = 'md',
  isOwner = false,
  isWatcher = false,
  isOnline = true,
  isCurrentTurn = false,
  showCrown = true,
  className = '',
}: AvatarProps) {
  const s = sizeMap[size];
  const initials = getInitials(name);

  return (
    <div className={`relative inline-block ${className}`}>
      {isOnline && !isCurrentTurn && (
        <motion.span
          className="absolute -inset-1 rounded-full animate-online-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />
      )}
      {isCurrentTurn && (
        <motion.span
          className="absolute -inset-1.5 rounded-full animate-pulse-ring"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.55) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />
      )}
      <motion.div
        className={`${s.w} relative rounded-full flex items-center justify-center font-display text-white select-none transition-all duration-300`}
        style={{
          background: isOnline ? color : 'linear-gradient(135deg, #52525b 0%, #3f3f46 100%)',
          filter: isOnline ? 'none' : 'grayscale(100%) brightness(0.7)',
          boxShadow: isCurrentTurn
            ? '0 0 0 2px rgba(255,255,255,0.9), 0 0 24px rgba(139, 92, 246, 0.7)'
            : isOnline
            ? '0 4px 14px rgba(0,0,0,0.3)'
            : '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1,
        }}
        whileHover={!isCurrentTurn && isOnline ? { scale: 1.1, y: -2 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <span className={s.text} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
          {initials}
        </span>
        {isWatcher && size !== 'sm' && (
          <span className="absolute -bottom-0.5 -right-0.5 bg-white/90 rounded-full p-0.5">
            <Eye className="w-3 h-3 text-purple-600" />
          </span>
        )}
      </motion.div>
      {showCrown && isOwner && (
        <motion.span
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-amber-400 z-10"
          animate={{ y: [0, -2, 0], rotate: [-3, 0, 3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: isOnline ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' : 'grayscale(100%)' }}
        >
          <Crown className={s.crown} />
        </motion.span>
      )}
      {!isWatcher && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-ink-900 z-20 ${
            isOnline ? 'bg-emerald-400 animate-online-dot' : 'bg-zinc-500'
          }`}
        />
      )}
    </div>
  );
}
