import { motion } from 'framer-motion';

interface ChainConnectorProps {
  animated?: boolean;
  layout?: 'horizontal' | 'vertical';
  delay?: number;
  index?: number;
}

export default function ChainConnector({
  animated = false,
  layout = 'horizontal',
  delay = 0,
}: ChainConnectorProps) {
  const isHorizontal = layout === 'horizontal';

  return (
    <div
      className={`flex items-center justify-center ${
        isHorizontal ? 'w-8 md:w-14 self-stretch' : 'h-6 md:h-8 w-full self-stretch'
      }`}
    >
      {isHorizontal ? (
        <svg className="h-full w-full overflow-visible" viewBox="0 0 60 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`lineGrad-${delay}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.4)" />
              <stop offset="50%" stopColor="rgba(236, 72, 153, 0.9)" />
              <stop offset="100%" stopColor="rgba(236, 72, 153, 0.4)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <motion.path
            d="M 2 20 C 15 6, 45 34, 58 20"
            stroke={`url(#lineGrad-${delay})`}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            filter="url(#glow)"
            initial={animated ? { pathLength: 0, opacity: 0 } : false}
            animate={animated ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
          />
          {animated && (
            <motion.circle
              cx="2"
              cy="20"
              r="4"
              fill="#ec4899"
              filter="url(#glow)"
              initial={{ cx: 2, opacity: 0 }}
              animate={{ cx: [2, 58], opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, delay: delay + 0.1, ease: 'easeInOut' }}
            />
          )}
        </svg>
      ) : (
        <svg className="w-full h-full overflow-visible" viewBox="0 0 40 60" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`vLineGrad-${delay}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.6)" />
              <stop offset="50%" stopColor="rgba(236, 72, 153, 0.95)" />
              <stop offset="100%" stopColor="rgba(236, 72, 153, 0.4)" />
            </linearGradient>
          </defs>
          <motion.path
            d="M 20 2 C 6 15, 34 45, 20 58"
            stroke={`url(#vLineGrad-${delay})`}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            filter="url(#glow)"
            initial={animated ? { pathLength: 0, opacity: 0 } : false}
            animate={animated ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
          />
        </svg>
      )}
    </div>
  );
}
