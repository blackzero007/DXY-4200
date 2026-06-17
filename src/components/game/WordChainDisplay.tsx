import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, Search, X, Users } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [authorDropdownOpen, setAuthorDropdownOpen] = useState(false);
  const authorDropdownRef = useRef<HTMLDivElement>(null);

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

  const uniqueAuthors = useMemo(() => {
    const map = new Map<string, { id: string; name: string; color: string }>();
    chain.forEach((w) => {
      if (!map.has(w.authorId)) {
        map.set(w.authorId, {
          id: w.authorId,
          name: w.authorId === 'system' ? '✨ 系统起词' : w.authorName,
          color: w.authorColor,
        });
      }
    });
    return Array.from(map.values());
  }, [chain]);

  const hasActiveFilter = searchQuery.trim() !== '' || selectedAuthor !== 'all';

  const getWordMatchState = useCallback(
    (word: ChainWord) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = query === '' || word.word.toLowerCase().includes(query);
      const matchesAuthor = selectedAuthor === 'all' || word.authorId === selectedAuthor;

      if (!hasActiveFilter) {
        return { isHighlighted: false, isDimmed: false };
      }

      const isMatch = matchesSearch && matchesAuthor;
      return {
        isHighlighted: query !== '' && matchesSearch && matchesAuthor,
        isDimmed: !isMatch,
      };
    },
    [searchQuery, selectedAuthor, hasActiveFilter]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        authorDropdownRef.current &&
        !authorDropdownRef.current.contains(e.target as Node)
      ) {
        setAuthorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 md:gap-3 w-[92%] md:w-auto md:min-w-[480px]">
        <div className="relative flex-1 md:flex-none md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索词链中的词…"
            className="w-full pl-9 pr-9 py-2 md:py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10
                       text-white/80 placeholder:text-white/30 text-sm font-medium
                       focus:outline-none focus:border-indigo-400/50 focus:bg-white/10
                       transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full
                         hover:bg-white/10 transition-colors text-white/50 hover:text-white/80"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div ref={authorDropdownRef} className="relative flex-shrink-0">
          <button
            onClick={() => setAuthorDropdownOpen((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 rounded-full
                       bg-white/5 backdrop-blur-md border text-sm font-medium
                       transition-all duration-200 focus:outline-none ${
                         selectedAuthor !== 'all'
                           ? 'border-indigo-400/50 bg-indigo-500/10 text-white'
                           : 'border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                       }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">
              {selectedAuthor === 'all'
                ? '全部玩家'
                : uniqueAuthors.find((a) => a.id === selectedAuthor)?.name ?? '全部玩家'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                authorDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {authorDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 min-w-[180px] rounded-2xl
                           bg-ink-800/95 backdrop-blur-xl border border-white/10
                           shadow-2xl py-1.5 z-50 overflow-hidden"
              >
                <button
                  onClick={() => {
                    setSelectedAuthor('all');
                    setAuthorDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    selectedAuthor === 'all'
                      ? 'bg-indigo-500/20 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  🎯 全部玩家
                </button>
                <div className="my-1 border-t border-white/10" />
                {uniqueAuthors.map((author) => (
                  <button
                    key={author.id}
                    onClick={() => {
                      setSelectedAuthor(author.id);
                      setAuthorDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                      selectedAuthor === author.id
                        ? 'bg-indigo-500/20 text-white'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-gradient-to-br"
                      style={{
                        background:
                          author.color && author.color.startsWith('from-')
                            ? undefined
                            : author.color || '#a78bfa',
                      }}
                    />
                    {author.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {hasActiveFilter && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedAuthor('all');
            }}
            className="hidden md:inline-flex items-center gap-1 px-3 py-2 rounded-full
                       bg-rose-500/10 border border-rose-400/30 text-rose-300 text-xs font-medium
                       hover:bg-rose-500/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            清除筛选
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative overflow-auto custom-scrollbar px-6 pt-14 pb-8 md:px-10 md:pt-16 md:pb-12 ${
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
              {chain.map((w, i) => {
                const { isHighlighted, isDimmed } = getWordMatchState(w);
                const nextWord = chain[i + 1];
                const connectorDimmed =
                  hasActiveFilter && (isDimmed || (nextWord ? getWordMatchState(nextWord).isDimmed : false));
                return (
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
                      isHighlighted={isHighlighted}
                      isDimmed={isDimmed}
                      searchQuery={searchQuery}
                    />
                    {i < chain.length - 1 && (
                      <div className={connectorDimmed ? 'opacity-40 transition-opacity duration-300' : 'transition-opacity duration-300'}>
                        <ChainConnector
                          animated={i === latestIndex - 1}
                          layout={layout}
                          delay={i === latestIndex - 1 ? 0.35 : 0}
                          index={i}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}
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
