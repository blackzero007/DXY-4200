import { motion, type Variants } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { Toast, ToastType } from './types';
import { cn } from '@/lib/utils';

interface ToastItemProps {
  toast: Toast;
  index: number;
  onDismiss: (id: string) => void;
}

const iconMap: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styleMap: Record<ToastType, { bg: string; border: string; icon: string; progress: string }> = {
  success: {
    bg: 'from-emerald-500/15 to-emerald-500/5',
    border: 'border-emerald-400/40',
    icon: 'text-emerald-400',
    progress: 'bg-emerald-400',
  },
  error: {
    bg: 'from-rose-500/15 to-rose-500/5',
    border: 'border-rose-400/40',
    icon: 'text-rose-400',
    progress: 'bg-rose-400',
  },
  warning: {
    bg: 'from-amber-500/15 to-amber-500/5',
    border: 'border-amber-400/40',
    icon: 'text-amber-400',
    progress: 'bg-amber-400',
  },
  info: {
    bg: 'from-sky-500/15 to-sky-500/5',
    border: 'border-sky-400/40',
    icon: 'text-sky-400',
    progress: 'bg-sky-400',
  },
};

const toastVariants: Variants = {
  hidden: (index: number) => ({
    opacity: 0,
    x: 120,
    scale: 0.9,
    y: index * 4,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  }),
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    y: index * 4,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
      delay: index * 0.04,
    },
  }),
  exit: {
    opacity: 0,
    x: 120,
    scale: 0.9,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
  },
};

export function ToastItem({ toast, index, onDismiss }: ToastItemProps) {
  const Icon = iconMap[toast.type];
  const styles = styleMap[toast.type];
  const duration = toast.duration ?? 3000;

  return (
    <motion.li
      layout
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={index}
      variants={toastVariants}
      className={cn(
        'relative w-[340px] max-w-[92vw] overflow-hidden rounded-2xl border',
        'bg-gradient-to-br backdrop-blur-xl shadow-xl',
        'pointer-events-auto',
        styles.bg,
        styles.border
      )}
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="flex items-start gap-3 px-4 py-3.5 pr-10">
        <div className={cn('mt-0.5 shrink-0', styles.icon)}>
          <Icon size={22} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14.5px] leading-relaxed text-white/95 break-words">
            {toast.message}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className={cn(
            'absolute top-2.5 right-2.5 shrink-0 rounded-lg p-1',
            'text-white/50 hover:text-white/90 hover:bg-white/10',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30'
          )}
          aria-label="关闭通知"
        >
          <X size={16} strokeWidth={2.2} />
        </button>
      </div>
      <div className="h-[2.5px] w-full bg-white/5">
        <motion.div
          className={cn('h-full', styles.progress)}
          initial={{ width: '100%' }}
          animate={{ width: 0 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      </div>
    </motion.li>
  );
}
