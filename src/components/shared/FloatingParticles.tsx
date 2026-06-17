import { motion } from 'framer-motion';
import { useMemo, useRef, useEffect } from 'react';

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

interface ParticleData {
  id: number;
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  opacity: number;
  currentOffsetX: number;
  currentOffsetY: number;
  targetOffsetX: number;
  targetOffsetY: number;
  element: HTMLSpanElement | null;
}

const PARTICLE_COLORS = [
  'rgba(139, 92, 246, 0.6)',
  'rgba(236, 72, 153, 0.5)',
  'rgba(99, 102, 241, 0.5)',
  'rgba(16, 185, 129, 0.45)',
  'rgba(245, 158, 11, 0.45)',
  'rgba(168, 85, 247, 0.55)',
];

const REPEL_RADIUS = 150;
const REPEL_STRENGTH = 80;
const LERP_FACTOR = 0.08;

export default function FloatingParticles({
  count = 28,
  className = '',
}: FloatingParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<ParticleData[]>([]);
  const mousePosRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef<number>(0);

  const particlesConfig = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      baseX: Math.random() * 100,
      baseY: Math.random() * 100,
      size: Math.random() * 18 + 4,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      duration: Math.random() * 12 + 10,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.6 + 0.2,
    }));
  }, [count]);

  useEffect(() => {
    particlesRef.current = particlesConfig.map((p) => ({
      ...p,
      currentOffsetX: 0,
      currentOffsetY: 0,
      targetOffsetX: 0,
      targetOffsetY: 0,
      element: null,
    }));
  }, [particlesConfig]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mousePosRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const updateParticles = () => {
      if (!containerRef.current) {
        animFrameRef.current = requestAnimationFrame(updateParticles);
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const { x: mx, y: my } = mousePosRef.current;

      particlesRef.current.forEach((p) => {
        const px = (p.baseX / 100) * rect.width;
        const py = (p.baseY / 100) * rect.height;

        const dx = px - mx;
        const dy = py - my;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < REPEL_RADIUS && distance > 0) {
          const force = (1 - distance / REPEL_RADIUS) * REPEL_STRENGTH;
          p.targetOffsetX = (dx / distance) * force;
          p.targetOffsetY = (dy / distance) * force;
        } else {
          p.targetOffsetX = 0;
          p.targetOffsetY = 0;
        }

        p.currentOffsetX += (p.targetOffsetX - p.currentOffsetX) * LERP_FACTOR;
        p.currentOffsetY += (p.targetOffsetY - p.currentOffsetY) * LERP_FACTOR;

        if (p.element) {
          p.element.style.setProperty(
            '--repel-x',
            `${p.currentOffsetX.toFixed(2)}px`
          );
          p.element.style.setProperty(
            '--repel-y',
            `${p.currentOffsetY.toFixed(2)}px`
          );
        }
      });

      animFrameRef.current = requestAnimationFrame(updateParticles);
    };

    animFrameRef.current = requestAnimationFrame(updateParticles);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const setElementRef = (id: number) => (el: HTMLSpanElement | null) => {
    const particle = particlesRef.current.find((p) => p.id === id);
    if (particle) {
      particle.element = el;
    }
  };

  return (
    <div ref={containerRef} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {particlesConfig.map((p) => (
        <motion.span
          key={p.id}
          ref={setElementRef(p.id)}
          className="absolute rounded-full blur-[1px]"
          style={{
            left: `${p.baseX}%`,
            top: `${p.baseY}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            transform: 'translate(var(--repel-x, 0px), var(--repel-y, 0px))',
            willChange: 'transform',
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
