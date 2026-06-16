import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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
        className={`relative overflow-auto custom-scrollbar px-6 py-8 md:px-10 md:py-12 ${
          isMobile
            ? 'max-h-[48vh] flex flex-col items-center'
            : 'min-h-[38vh] md:min-h-[40vh] whitespace-nowrap flex items-center'
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
    </div>
  );
}
