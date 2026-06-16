import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ONBOARDING_KEY = 'wordchain_onboarding_visited';
const ONBOARDING_STEP_KEY = 'wordchain_onboarding_step';

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
  buttonText?: string;
  autoScroll?: boolean;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'onboarding-hero-section',
    title: '欢迎来到脑洞大开花式接词！',
    description: '这是一个创意无限的词语接龙游戏，不限成语，自由脑洞。用字词编织属于你的想象力链条，从「程序员」到「明星大侦探」，一切由你定义！',
    placement: 'bottom',
    buttonText: '开始体验',
    autoScroll: true,
  },
  {
    targetId: 'onboarding-word-input',
    title: '输入区 - 接词规则',
    description: '在这里输入你的词语，需要以上一个词的最后一个字开头（允许同音字）。点击「提示」可以获取灵感，输入完成后点击「提交」或按回车键确认。',
    placement: 'top',
    autoScroll: true,
  },
  {
    targetId: 'onboarding-word-chain',
    title: '词链展示区 - 查看成果',
    description: '你接的每一个词都会在这里展示，形成一条绚丽的词链。词越长越有创意，得分也就越高！尽情发挥你的想象力吧～',
    placement: 'bottom',
    buttonText: '我知道了',
    autoScroll: true,
  },
];

export function useOnboardingStatus() {
  const [shouldShow, setShouldShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    try {
      const visited = localStorage.getItem(ONBOARDING_KEY);
      if (!visited) {
        const savedStep = localStorage.getItem(ONBOARDING_STEP_KEY);
        const step = savedStep ? parseInt(savedStep, 10) : 0;
        setCurrentStep(step >= 0 && step < TOUR_STEPS.length ? step : 0);
        setShouldShow(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const markCompleted = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      localStorage.removeItem(ONBOARDING_STEP_KEY);
    } catch {
      /* ignore */
    }
    setShouldShow(false);
  }, []);

  const saveStep = useCallback((step: number) => {
    try {
      localStorage.setItem(ONBOARDING_STEP_KEY, String(step));
    } catch {
      /* ignore */
    }
    setCurrentStep(step);
  }, []);

  return { shouldShow, currentStep, setCurrentStep: saveStep, markCompleted };
}

interface OnboardingTourProps {
  isOpen: boolean;
  initialStep?: number;
  onClose: () => void;
  onStepChange?: (step: number) => void;
}

export default function OnboardingTour({
  isOpen,
  initialStep = 0,
  onClose,
  onStepChange,
}: OnboardingTourProps) {
  const [step, setStep] = useState(initialStep);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStepConfig = TOUR_STEPS[step];

  const updateTargetPosition = useCallback(() => {
    if (!currentStepConfig) return;

    const target = document.getElementById(currentStepConfig.targetId);
    if (!target) {
      setTargetRect(null);
      return;
    }

    if (currentStepConfig.autoScroll) {
      const rect = target.getBoundingClientRect();
      const viewportH = window.innerHeight;
      if (rect.top < 40 || rect.bottom > viewportH - 40) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      }
    }

    const rect = target.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const visibleTop = Math.max(rect.top, 0);
    const visibleBottom = Math.min(rect.bottom, viewportH);
    const visibleLeft = Math.max(rect.left, 0);
    const visibleRight = Math.min(rect.right, viewportW);
    const visibleHeight = visibleBottom - visibleTop;
    const visibleWidth = visibleRight - visibleLeft;

    let highlightTop = rect.top;
    let highlightLeft = rect.left;
    let highlightHeight = rect.height;
    let highlightWidth = rect.width;

    if (visibleHeight <= 0 || visibleWidth <= 0) {
      highlightTop = Math.max(24, viewportH / 2 - 80);
      highlightLeft = Math.max(24, viewportW / 2 - 120);
      highlightHeight = 160;
      highlightWidth = 240;
    } else if (visibleHeight < viewportH * 0.3 || visibleWidth < viewportW * 0.3) {
      if (visibleHeight > visibleWidth) {
        highlightTop = visibleTop;
        highlightHeight = Math.max(visibleHeight, 120);
        highlightLeft = visibleLeft;
        highlightWidth = Math.max(visibleWidth, 200);
      } else {
        highlightLeft = visibleLeft;
        highlightWidth = Math.max(visibleWidth, 200);
        highlightTop = visibleTop;
        highlightHeight = Math.max(visibleHeight, 120);
      }
    }

    const padding = 8;
    const paddedRect = new DOMRect(
      highlightLeft - padding,
      highlightTop - padding,
      highlightWidth + padding * 2,
      highlightHeight + padding * 2
    );
    setTargetRect(paddedRect);

    const tooltipWidth = Math.min(360, viewportW - 48);
    const tooltipHeight = 260;
    const gap = 16;
    const margin = 24;

    let top = 0;
    let left = 0;
    let arrowTop = 0;
    let arrowLeft = 0;

    const centerX = paddedRect.left + paddedRect.width / 2;
    const centerY = paddedRect.top + paddedRect.height / 2;

    const spaceTop = paddedRect.top - margin;
    const spaceBottom = viewportH - paddedRect.bottom - margin;
    const spaceLeft = paddedRect.left - margin;
    const spaceRight = viewportW - paddedRect.right - margin;

    const canBottom = spaceBottom >= tooltipHeight + gap;
    const canTop = spaceTop >= tooltipHeight + gap;
    const canRight = spaceRight >= tooltipWidth + gap;
    const canLeft = spaceLeft >= tooltipWidth + gap;

    let finalPlacement = currentStepConfig.placement;
    if (!canBottom && !canTop && !canRight && !canLeft) {
      if (Math.max(spaceTop, spaceBottom) >= Math.max(spaceLeft, spaceRight)) {
        finalPlacement = spaceTop >= spaceBottom ? 'top' : 'bottom';
      } else {
        finalPlacement = spaceLeft >= spaceRight ? 'left' : 'right';
      }
    } else {
      const pref = currentStepConfig.placement;
      const isOk = (p: string) =>
        (p === 'bottom' && canBottom) ||
        (p === 'top' && canTop) ||
        (p === 'right' && canRight) ||
        (p === 'left' && canLeft);
      if (!isOk(pref)) {
        const order = ['bottom', 'top', 'right', 'left'] as const;
        for (const p of order) {
          if (isOk(p)) {
            finalPlacement = p;
            break;
          }
        }
      }
    }

    switch (finalPlacement) {
      case 'bottom': {
        const rawTop = paddedRect.bottom + gap;
        top = Math.min(rawTop, viewportH - tooltipHeight - margin);
        left = Math.max(margin, Math.min(centerX - tooltipWidth / 2, viewportW - tooltipWidth - margin));
        const anchorX = Math.max(paddedRect.left, Math.min(centerX, paddedRect.right));
        arrowTop = -8;
        arrowLeft = Math.max(16, Math.min(anchorX - left, tooltipWidth - 16));
        break;
      }
      case 'top': {
        const rawTop = paddedRect.top - gap - tooltipHeight;
        top = Math.max(margin, rawTop);
        left = Math.max(margin, Math.min(centerX - tooltipWidth / 2, viewportW - tooltipWidth - margin));
        const anchorX = Math.max(paddedRect.left, Math.min(centerX, paddedRect.right));
        arrowTop = tooltipHeight;
        arrowLeft = Math.max(16, Math.min(anchorX - left, tooltipWidth - 16));
        break;
      }
      case 'right': {
        const rawLeft = paddedRect.right + gap;
        left = Math.min(rawLeft, viewportW - tooltipWidth - margin);
        top = Math.max(margin, Math.min(centerY - tooltipHeight / 2, viewportH - tooltipHeight - margin));
        const anchorY = Math.max(paddedRect.top, Math.min(centerY, paddedRect.bottom));
        arrowLeft = -8;
        arrowTop = Math.max(16, Math.min(anchorY - top, tooltipHeight - 16));
        break;
      }
      case 'left': {
        const rawLeft = paddedRect.left - gap - tooltipWidth;
        left = Math.max(margin, rawLeft);
        top = Math.max(margin, Math.min(centerY - tooltipHeight / 2, viewportH - tooltipHeight - margin));
        const anchorY = Math.max(paddedRect.top, Math.min(centerY, paddedRect.bottom));
        arrowLeft = tooltipWidth;
        arrowTop = Math.max(16, Math.min(anchorY - top, tooltipHeight - 16));
        break;
      }
    }

    setTooltipPosition({ top, left });
    setArrowPosition({ top: arrowTop, left: arrowLeft });
  }, [currentStepConfig]);

  useEffect(() => {
    if (!isOpen) return;

    updateTargetPosition();
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition, true);

    const interval = setInterval(updateTargetPosition, 300);

    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition, true);
      clearInterval(interval);
    };
  }, [isOpen, step, updateTargetPosition]);

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      onStepChange?.(nextStep);

      if (nextStep === 1) {
        navigate('/game/solo?difficulty=normal');
      }
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      onStepChange?.(prevStep);

      if (prevStep === 0) {
        navigate('/');
      }
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen || !currentStepConfig) return null;

  const isFirstStep = step === 0;
  const isLastStep = step === TOUR_STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] pointer-events-none"
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto"
          onClick={handleSkip}
        />

        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute pointer-events-none"
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
              boxShadow: '0 0 0 4px rgba(168, 85, 247, 0.6), 0 0 40px rgba(168, 85, 247, 0.4)',
              borderRadius: '24px',
            }}
          />
        )}

        {targetRect && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute pointer-events-auto"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              width: 'min(360px, calc(100vw - 48px))',
            }}
          >
            <div
              className="absolute w-4 h-4 bg-gradient-to-br from-purple-600 to-fuchsia-600 rotate-45"
              style={{
                top: arrowPosition.top,
                left: arrowPosition.left,
                transform: 'rotate(45deg)',
              }}
            />

            <div className="relative glass-panel rounded-3xl p-6 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg">
                  {step + 1}
                </div>
                <div>
                  <h3 className="font-display text-xl text-white">
                    {currentStepConfig.title}
                  </h3>
                  <div className="flex gap-1.5 mt-1">
                    {TOUR_STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === step
                            ? 'w-8 bg-gradient-to-r from-purple-400 to-fuchsia-400'
                            : i < step
                            ? 'w-4 bg-purple-400/60'
                            : 'w-4 bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-white/75 text-sm leading-relaxed mb-6 pr-6">
                {currentStepConfig.description}
              </p>

              <div className="flex items-center justify-between gap-3">
                {isFirstStep ? (
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2.5 rounded-xl text-white/60 hover:text-white/80 text-sm transition-colors"
                  >
                    跳过
                  </button>
                ) : (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-sm transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    上一步
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-medium text-sm hover:from-purple-600 hover:to-fuchsia-600 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                >
                  {isLastStep ? (
                    currentStepConfig.buttonText || '完成'
                  ) : (
                    <>
                      {currentStepConfig.buttonText || '下一步'}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
