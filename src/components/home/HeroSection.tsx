import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const DEMO_CHAIN = ['程序员', '猿猴', '猴面包树', '树叶', '叶脉书签', '签名', '明星大侦探'];
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
  return (
    <section id="onboarding-hero-section" className="relative w-full px-4 pt-14 pb-8 md:pt-20 md:pb-12 text-center">
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
        className="relative max-w-5xl mx-auto py-6"
      >
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {DEMO_CHAIN.map((word, i) => (
            <motion.div
              key={word}
              initial={{ opacity: 0, x: 30, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.6 + i * 0.12,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="group relative"
            >
              <span
                className={`inline-block px-4 py-2 md:px-6 md:py-3 rounded-2xl font-display text-lg md:text-2xl bg-gradient-to-br ${DEMO_COLORS[i % DEMO_COLORS.length]} text-white shadow-glow-purple transition-all duration-300 hover:scale-110 hover:-translate-y-1`}
                style={{
                  boxShadow: i === DEMO_CHAIN.length - 1
                    ? '0 0 40px rgba(236, 72, 153, 0.5)'
                    : undefined,
                }}
              >
                {word}
              </span>
              {i < DEMO_CHAIN.length - 1 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.85 + i * 0.12,
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
        </div>
      </motion.div>
    </section>
  );
}
