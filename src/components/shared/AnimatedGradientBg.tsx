import { motion } from 'framer-motion';

export default function AnimatedGradientBg() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10 noise-bg">
      <motion.div
        className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.45) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, 80, -40, 0],
          y: [0, 60, -80, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[10%] -right-[15%] w-[55vw] h-[55vw] rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 40, -60, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute bottom-[-15%] left-[25%] w-[50vw] h-[50vw] rounded-full blur-[130px]"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, 50, -60, 0],
          y: [0, -40, 60, 0],
          scale: [1, 0.95, 1.2, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
      <motion.div
        className="absolute bottom-[5%] right-[15%] w-[40vw] h-[40vw] rounded-full blur-[100px]"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 30, -40, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />
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
