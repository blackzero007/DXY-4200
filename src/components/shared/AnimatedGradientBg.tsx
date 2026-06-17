import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface GlowConfig {
  positionClass: string;
  sizeClass: string;
  blur: string;
  baseHues: number[];
  saturation: number;
  lightness: number;
  alpha: number;
  xAnim: number[];
  yAnim: number[];
  scaleAnim: number[];
  moveDuration: number;
  delay: number;
}

const GLOW_CONFIGS: GlowConfig[] = [
  {
    positionClass: 'absolute -top-[20%] -left-[10%]',
    sizeClass: 'w-[60vw] h-[60vw]',
    blur: '120px',
    baseHues: [260, 290, 320, 260],
    saturation: 70,
    lightness: 55,
    alpha: 0.45,
    xAnim: [0, 80, -40, 0],
    yAnim: [0, 60, -80, 0],
    scaleAnim: [1, 1.2, 0.9, 1],
    moveDuration: 22,
    delay: 0,
  },
  {
    positionClass: 'absolute top-[10%] -right-[15%]',
    sizeClass: 'w-[55vw] h-[55vw]',
    blur: '120px',
    baseHues: [330, 0, 30, 330],
    saturation: 75,
    lightness: 55,
    alpha: 0.4,
    xAnim: [0, -60, 40, 0],
    yAnim: [0, 40, -60, 0],
    scaleAnim: [1, 1.15, 0.95, 1],
    moveDuration: 26,
    delay: 2,
  },
  {
    positionClass: 'absolute bottom-[-15%] left-[25%]',
    sizeClass: 'w-[50vw] h-[50vw]',
    blur: '130px',
    baseHues: [230, 260, 200, 230],
    saturation: 70,
    lightness: 55,
    alpha: 0.4,
    xAnim: [0, 50, -60, 0],
    yAnim: [0, -40, 60, 0],
    scaleAnim: [1, 0.95, 1.2, 1],
    moveDuration: 30,
    delay: 4,
  },
  {
    positionClass: 'absolute bottom-[5%] right-[15%]',
    sizeClass: 'w-[40vw] h-[40vw]',
    blur: '100px',
    baseHues: [160, 180, 140, 160],
    saturation: 65,
    lightness: 50,
    alpha: 0.25,
    xAnim: [0, -40, 30, 0],
    yAnim: [0, 30, -40, 0],
    scaleAnim: [1, 1.1, 0.9, 1],
    moveDuration: 18,
    delay: 6,
  },
];

const COLOR_CYCLE_DURATION = 45;

const hslToString = (h: number, s: number, l: number, a: number) =>
  `hsla(${h % 360}, ${s}%, ${l}%, ${a})`;

const buildRadialGradient = (h: number, s: number, l: number, a: number) =>
  `radial-gradient(circle, ${hslToString(h, s, l, a)} 0%, transparent 70%)`;

function AnimatedGlow({ config }: { config: GlowConfig }) {
  const glowRef = useRef<HTMLDivElement>(null);
  const hueOffsetRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animateColors = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) / 1000;
      const progress = (elapsed % COLOR_CYCLE_DURATION) / COLOR_CYCLE_DURATION;
      const numColors = config.baseHues.length;
      const totalProgress = progress * numColors;
      const segmentIndex = Math.floor(totalProgress) % numColors;
      const segmentProgress = totalProgress - Math.floor(totalProgress);

      const hueA = config.baseHues[segmentIndex];
      const hueB = config.baseHues[(segmentIndex + 1) % numColors];
      const currentHue = hueA + (hueB - hueA) * segmentProgress;

      hueOffsetRef.current = currentHue;

      if (glowRef.current) {
        glowRef.current.style.background = buildRadialGradient(
          currentHue,
          config.saturation,
          config.lightness,
          config.alpha
        );
      }

      animFrameRef.current = requestAnimationFrame(animateColors);
    };

    animFrameRef.current = requestAnimationFrame(animateColors);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      startTimeRef.current = null;
    };
  }, [config]);

  return (
    <motion.div
      ref={glowRef}
      className={`${config.positionClass} ${config.sizeClass} rounded-full`}
      style={{
        filter: `blur(${config.blur})`,
        background: buildRadialGradient(
          config.baseHues[0],
          config.saturation,
          config.lightness,
          config.alpha
        ),
      }}
      animate={{
        x: config.xAnim,
        y: config.yAnim,
        scale: config.scaleAnim,
      }}
      transition={{
        duration: config.moveDuration,
        delay: config.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export default function AnimatedGradientBg() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10 noise-bg">
      {GLOW_CONFIGS.map((config, idx) => (
        <AnimatedGlow key={idx} config={config} />
      ))}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
