import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  opacity: number;
}

const PARTICLE_COLORS = [
  'rgba(139, 92, 246, 0.6)',
  'rgba(236, 72, 153, 0.5)',
  'rgba(99, 102, 241, 0.5)',
  'rgba(16, 185, 129, 0.45)',
  'rgba(245, 158, 11, 0.45)',
  'rgba(168, 85, 247, 0.55)',
];

export default function FloatingParticles({
  count = 28,
  className = '',
}: FloatingParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 18 + 4,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      duration: Math.random() * 12 + 10,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.6 + 0.2,
    }));
  }, [count]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full blur-[1px]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
          animate={{
            y: [0, -60, 0, 40, 0],
            x: [0, 30, -20, 40, 0],
            scale: [1, 1.3, 0.9, 1.2, 1],
            opacity: [p.opacity, p.opacity * 1.4, p.opacity * 0.6, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
