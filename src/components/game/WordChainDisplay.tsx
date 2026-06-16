import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import WordBlock from './WordBlock';
import ChainConnector from './ChainConnector';
import type { ChainWord } from '@/types';

interface WordChainDisplayProps {
  chain: ChainWord[];
  className?: string;
}

export default function WordChainDisplay({ chain, className = '' }: WordChainDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [showJumpButton, setShowJumpButton] = useState(false);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const scrollStartXRef = useRef(0);
  const scrollStartYRef = useRef(0);

  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const lastTouchPosRef = useRef({ x: 0, y: 0, t: 0 });
  const inertiaRafRef = useRef<number | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const checkOverflow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (isMobile) {
      const overflow = el.scrollHeight > el.clientHeight + 1;
      setIsOverflowing(overflow);
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
      setShowJumpButton(overflow && !atBottom);
    } else {
      const overflow = el.scrollWidth > el.clientWidth + 1;
      setIsOverflowing(overflow);
      const atRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 20;
      setShowJumpButton(overflow && !atRight);
    }
  }, [isMobile]);

  useEffect(() => {
    const timer = setTimeout(checkOverflow, 100);
    return () => clearTimeout(timer);
  }, [chain.length, isMobile, checkOverflow]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkOverflow, { passive: true });
    window.addEventListener('resize', checkOverflow);
    return () => {
      el.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [checkOverflow]);

  useEffect(() => {
    if (scrollRef.current && chain.length > 1) {
      const el = scrollRef.current;
      if (isMobile) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      } else {
        el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
      }
    }
  }, [chain.length, isMobile]);

  const handleJumpToLatest = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (isMobile) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } else {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    }
  }, [isMobile]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMobile) return;
    const el = scrollRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX;
    scrollStartXRef.current = el.scrollLeft;
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  }, [isMobile]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isMobile) return;
    if (!isDraggingRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.pageX - startXRef.current;
    el.scrollLeft = scrollStartXRef.current - dx;
  }, [isMobile]);

  const handleMouseUp = useCallback(() => {
    if (isMobile) return;
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const el = scrollRef.current;
    if (!el) return;
    el.style.cursor = '';
    el.style.userSelect = '';
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const el = scrollRef.current;
    if (!el) return;
    el.style.cursor = '';
    el.style.userSelect = '';
  }, [isMobile]);

  const cancelInertia = useCallback(() => {
    if (inertiaRafRef.current !== null) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }
  }, []);

  const startInertia = useCallback(() => {
    cancelInertia();
    const el = scrollRef.current;
    if (!el) return;
    let { vx, vy } = velocityRef.current;
    const friction = 0.95;
    const minVelocity = 0.5;

    const animate = () => {
      vx *= friction;
      vy *= friction;
      if (Math.abs(vx) < minVelocity && Math.abs(vy) < minVelocity) {
        inertiaRafRef.current = null;
        return;
      }
      el.scrollLeft -= vx;
      el.scrollTop -= vy;
      inertiaRafRef.current = requestAnimationFrame(animate);
    };
    inertiaRafRef.current = requestAnimationFrame(animate);
  }, [cancelInertia]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    touchStartYRef.current = touch.clientY;
    touchStartXRef.current = touch.clientX;
    touchStartTimeRef.current = performance.now();
    lastTouchPosRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      t: performance.now(),
    };
    velocityRef.current = { vx: 0, vy: 0 };
    cancelInertia();
  }, [isMobile, cancelInertia]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    const now = performance.now();
    const last = lastTouchPosRef.current;
    const dt = now - last.t;
    if (dt > 0) {
      velocityRef.current = {
        vx: (last.x - touch.clientX) / dt * 16,
        vy: (last.y - touch.clientY) / dt * 16,
      };
    }
    lastTouchPosRef.current = { x: touch.clientX, y: touch.clientY, t: now };
  }, [isMobile]);

  const handleTouchEnd = useCallback(() => {
    if (!isMobile) return;
    startInertia();
  }, [isMobile, startInertia]);

  const layout: 'horizontal' | 'vertical' = isMobile ? 'vertical' : 'horizontal';
  const latestIndex = chain.length - 1;

  return (
    <div id="onboarding-word-chain" className={`relative ${className}`}>
      <div className="absolute inset-x-0 top-0 h-12 md:h-16 bg-gradient-to-b from-ink-900/90 to-transparent pointer-events-none z-20 rounded-t-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-12 md:h-16 bg-gradient-to-t from-ink-900/90 to-transparent pointer-events-none z-20 rounded-b-3xl" />
      <div className={`absolute inset-y-0 left-0 w-16 md:w-20 bg-gradient-to-r from-ink-900/90 to-transparent pointer-events-none z-20 rounded-l-3xl ${isMobile ? 'hidden' : ''}`} />
      <div className={`absolute inset-y-0 right-0 w-16 md:w-20 bg-gradient-to-l from-ink-900/90 to-transparent pointer-events-none z-20 rounded-r-3xl ${isMobile ? 'hidden' : ''}`} />

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative overflow-auto custom-scrollbar px-6 py-8 md:px-10 md:py-12 ${
          isMobile
            ? 'max-h-[48vh] flex flex-col items-center'
            : 'min-h-[38vh] md:min-h-[40vh] whitespace-nowrap flex items-center cursor-grab active:cursor-grabbing'
        }`}
      >
        {chain.length === 0 ? (
          <div className="w-full text-center py-16 text-white/40 text-sm md:text-base">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex flex-col items-center gap-3"
            >
              <span className="text-5xl animate-float">✨</span>
              <span className="font-display text-xl md:text-2xl text-white/60">
                词链准备就绪，等待第一颗脑洞种子…
              </span>
            </motion.div>
          </div>
        ) : (
          <div
            className={`relative flex ${
              isMobile ? 'flex-col items-center' : 'items-center'
            } mx-auto`}
          >
            <AnimatePresence mode="popLayout">
              {chain.map((w, i) => (
                <motion.div
                  key={w.id}
                  layout
                  className={`flex ${isMobile ? 'flex-col items-center' : 'items-center'}`}
                >
                  <WordBlock
                    word={w}
                    isFirst={i === 0}
                    isLatest={i === latestIndex}
                    layout={layout}
                    index={i}
                  />
                  {i < chain.length - 1 && (
                    <ChainConnector
                      animated={i === latestIndex - 1}
                      layout={layout}
                      delay={i === latestIndex - 1 ? 0.35 : 0}
                      index={i}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showJumpButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={handleJumpToLatest}
            className="absolute bottom-5 right-5 z-30 inline-flex items-center gap-1.5 px-4 py-2.5
                       rounded-full font-display text-sm
                       bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                       text-white shadow-glow-purple
                       hover:scale-105 hover:shadow-glow-pink active:scale-95
                       transition-all duration-300 ease-out
                       backdrop-blur-md"
            style={{ backgroundSize: '200% 200%', animation: 'gradient-shift 4s ease infinite' }}
          >
            {isMobile ? (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>最新词</span>
              </>
            ) : (
              <>
                <span>最新词</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
