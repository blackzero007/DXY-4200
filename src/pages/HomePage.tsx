import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedGradientBg from '@/components/shared/AnimatedGradientBg';
import FloatingParticles from '@/components/shared/FloatingParticles';
import HeroSection from '@/components/home/HeroSection';
import ModeSelector from '@/components/home/ModeSelector';
import HowToPlay from '@/components/home/HowToPlay';
import OnboardingTour, { useOnboardingStatus } from '@/components/shared/OnboardingTour';
import { useSoloGameStore } from '@/store/useSoloGameStore';
import { useRoomStore } from '@/store/useRoomStore';

export default function HomePage() {
  const cleanupSolo = useSoloGameStore(s => s.endGame);
  const cleanupRoom = useRoomStore(s => s.cleanupRoom);
  const { shouldShow, currentStep, setCurrentStep, markCompleted } = useOnboardingStatus();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    cleanupSolo();
    cleanupRoom();
  }, [cleanupSolo, cleanupRoom]);

  useEffect(() => {
    if (shouldShow && currentStep === 0) {
      setTimeout(() => setShowTour(true), 800);
    }
  }, [shouldShow, currentStep]);

  const handleClose = () => {
    setShowTour(false);
    markCompleted();
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen w-full"
    >
      <AnimatedGradientBg />
      <FloatingParticles count={40} />
      <div className="relative z-10 max-w-7xl mx-auto pb-16 md:pb-24">
        <HeroSection />
        <ModeSelector />
        <HowToPlay />
        <footer className="mt-12 md:mt-20 text-center text-white/30 text-xs md:text-sm px-4">
          <p className="mb-2">
            ✨ 脑洞大开花式接词 · 用字词编织想象的银河
          </p>
          <p className="text-white/20">
            Tip: 多人模式可在同一浏览器开多个标签页，亲身体验多人接龙～
          </p>
        </footer>
      </div>

      {showTour && currentStep === 0 && (
        <OnboardingTour
          isOpen={showTour}
          initialStep={currentStep}
          onClose={handleClose}
          onStepChange={handleStepChange}
        />
      )}
    </motion.div>
  );
}
