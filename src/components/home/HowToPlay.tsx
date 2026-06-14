import { motion } from 'framer-motion';
import { Lightbulb, Scroll, PartyPopper } from 'lucide-react';

const STEPS = [
  {
    icon: <Lightbulb className="w-7 h-7" />,
    title: '拿到起始词',
    desc: '系统随机给出一个充满想象空间的起始词，比如「程序员」',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    icon: <Scroll className="w-7 h-7" />,
    title: '尾字接新招',
    desc: '用前一词的尾字（或同音字）开头，输入任何词汇或短语，「员」→「猿猴」',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: <PartyPopper className="w-7 h-7" />,
    title: '脑洞无极限',
    desc: '不用局限于成语！歌词、书名、网络梗……任何合理的表达都可以！',
    gradient: 'from-pink-500 to-fuchsia-500',
  },
];

const RULES = [
  { text: '以「上一词尾字」或「同音字」开头', highlight: true },
  { text: '至少 2 个字', highlight: false },
  { text: '之前出现过的词不能重复使用', highlight: false },
  { text: '不限于成语，任何合理词汇/短语均可', highlight: true },
  { text: '创意优先，脑洞越大越精彩！', highlight: true },
];

export default function HowToPlay() {
  return (
    <section className="w-full px-4 py-10 md:py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl text-white mb-3">
            <span className="text-gradient-warm">玩法说明</span>
          </h2>
          <p className="text-white/55 text-sm md:text-base">简单三步，开启你的脑洞接龙之旅</p>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20">
          <div
            className="hidden md:block absolute top-1/2 left-[16.6%] right-[16.6%] h-[2px] -translate-y-1/2 z-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(245,158,11,0.5) 0%, rgba(139,92,246,0.5) 50%, rgba(236,72,153,0.5) 100%)',
            }}
          />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 card-float p-6 md:p-8"
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.gradient} text-white flex items-center justify-center`}
                  style={{ boxShadow: '0 10px 30px rgba(139, 92, 246, 0.35)' }}
                >
                  {s.icon}
                </div>
                <span
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${s.gradient} text-white font-display text-xl flex items-center justify-center`}
                >
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display text-xl md:text-2xl text-white mb-2">{s.title}</h3>
              <p className="text-white/60 text-sm md:text-base leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-panel rounded-3xl p-6 md:p-10 max-w-3xl mx-auto"
        >
          <h3 className="font-display text-2xl md:text-3xl text-white mb-1 text-center">
            🎯 接词规则
          </h3>
          <p className="text-center text-white/50 text-sm mb-6 md:mb-8">
            宽松又好玩的规则，尽情发挥你的脑洞吧
          </p>
          <ul className="space-y-3 md:space-y-4 max-w-xl mx-auto">
            {RULES.map((r, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`flex items-start gap-3 p-3 md:p-4 rounded-2xl ${
                  r.highlight ? 'bg-purple-500/10 border border-purple-400/30' : 'bg-white/5 border border-white/10'
                }`}
              >
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    r.highlight
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      : 'bg-white/10 text-white/70'
                  }`}
                >
                  ✓
                </span>
                <span className={`text-sm md:text-base ${r.highlight ? 'text-white' : 'text-white/75'}`}>
                  {r.text}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
