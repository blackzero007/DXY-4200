import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const DEMO_CHAINS = [
  {
    theme: '科技创想',
    words: ['程序员', '猿猴', '猴面包树', '树叶', '叶脉书签', '签名', '明星大侦探'],
  },
  {
    theme: '自然之旅',
    words: ['山川湖海', '海洋生物', '物理公式', '方程式赛车', '车轮滚滚'],
  },
  {
    theme: '美食探险',
    words: ['麻辣火锅', '锅底捞月', '月光宝盒', '盒子蛋糕', '糕点师傅'],
  },
];

const DEMO_COLORS = [
  'from-indigo-500 to-purple-500',
  'from-purple-500 to-fuchsia-500',
  'from-fuchsia-500 to-pink-500',
  'from-pink-500 to-rose-500',
  'from-amber-500 to-orange-500',
  'from-teal-500 to-emerald-500',
  'from-sky-500 to-indigo-500',
];

export default function HeroSection() {
  const [chainIndex, setChainIndex] = useState(0);
  const currentChain = DEMO_CHAINS[chainIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setChainIndex((prev) => (prev + 1) % DEMO_CHAINS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  return (
    <section className="relative w-full px-4 pt-14 pb-8 md:pt-20 md:pb-12 text-center">
      <div id="onboarding-hero-section">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-xs md:text-sm text-white/75 mb-6 md:mb-10"
        >
          <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-300" />
          <span>不限成语！自由脑洞，尽情发挥你的创意 ✨</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-wide mb-5 md:mb-7"
        >
          <span className="text-gradient">脑洞大开</span>
          <br className="md:hidden" />
          <span className="text-white/95">花式接词</span>
        </motion.h1>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="text-base md:text-xl text-white/65 max-w-2xl mx-auto mb-10 md:mb-16 leading-relaxed"
      >
        用字词编织属于你的想象力链条
        <br className="hidden md:block" />
        以前一词的尾字作开头，从「程序员」到「明星大侦探」，一切由你定义
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-5xl mx-auto py-6 min-h-[140px]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={chainIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-2 md:gap-3"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="inline-block px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm text-xs md:text-sm text-purple-300 font-medium mb-2 md:mb-0 md:mr-2"
            >
              #{currentChain.theme}
            </motion.span>
            {currentChain.words.map((word, i) => (
              <motion.div
                key={`${chainIndex}-${word}`}
                initial={{ opacity: 0, x: 30, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 + i * 0.08,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                className="group relative"
              >
                <span
                  className={`inline-block px-4 py-2 md:px-6 md:py-3 rounded-2xl font-display text-lg md:text-2xl bg-gradient-to-br ${DEMO_COLORS[i % DEMO_COLORS.length]} text-white shadow-glow-purple transition-all duration-300 hover:scale-110 hover:-translate-y-1`}
                  style={{
                    boxShadow: i === currentChain.words.length - 1
                      ? '0 0 40px rgba(236, 72, 153, 0.5)'
                      : undefined,
                  }}
                >
                  {word}
                </span>
                {i < currentChain.words.length - 1 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.2 + i * 0.08,
                      type: 'spring',
                    }}
                    className="hidden sm:inline-flex absolute -right-2 top-1/2 -translate-y-1/2 text-purple-400 text-xl font-bold z-10"
                    style={{ textShadow: '0 0 10px rgba(139, 92, 246, 0.8)' }}
                  >
                    →
                  </motion.span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-2 mt-6">
          {DEMO_CHAINS.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => setChainIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === chainIndex ? 'w-8 bg-purple-400' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`切换到第${idx + 1}组词链`}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
