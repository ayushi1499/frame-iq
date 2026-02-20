import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScanFace, Sparkles, FileText, Camera, ArrowRight, X, Rocket } from "lucide-react";
import { useLocation } from "wouter";

const TOUR_KEY = "frameiq_tour_completed";

const steps = [
  {
    icon: Rocket,
    iconColor: "text-violet-400",
    title: "Welcome to Frame IQ",
    description: "Your all-in-one AI assistant for face recognition, facial analysis, and text summarization. Let us show you around!",
  },
  {
    icon: ScanFace,
    iconColor: "text-blue-400",
    title: "Face Recognition",
    description: "Register faces by uploading a photo and giving them a name. Then identify anyone by uploading or capturing their photo -- the AI matches them instantly.",
    nav: "/recognition",
  },
  {
    icon: Sparkles,
    iconColor: "text-purple-400",
    title: "Face Analysis",
    description: "Upload or capture a face photo and let AI detect age, gender, emotion, and ethnicity. Share your results directly to social media!",
    nav: "/analysis",
  },
  {
    icon: FileText,
    iconColor: "text-emerald-400",
    title: "Text Summarization",
    description: "Paste any long text -- articles, essays, documents -- and get a smart AI summary. Choose your style: concise, detailed, bullet points, or simple.",
    nav: "/summarize",
  },
  {
    icon: Camera,
    iconColor: "text-amber-400",
    title: "Live Camera Support",
    description: "Use your device camera to capture faces in real-time for recognition or analysis. Just tap 'Use Live Camera' on any face feature page.",
  },
];

interface OnboardingTourProps {
  show: boolean;
  onComplete: () => void;
}

export function OnboardingTour({ show, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [, navigate] = useLocation();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setCurrentStep(0);
    onComplete();
  };

  const handleTryIt = () => {
    const step = steps[currentStep];
    if (step.nav) {
      handleFinish();
      navigate(step.nav);
    }
  };

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) handleFinish(); }}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
          className="w-full max-w-md mx-4 mb-4"
        >
          <div className="bg-card border border-card-border rounded-md p-5 shadow-sm relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3"
              onClick={handleFinish}
              data-testid="button-tour-skip"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="w-full bg-muted rounded-full h-1 mb-5">
              <motion.div
                className="bg-primary h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`w-12 h-12 rounded-md bg-muted flex items-center justify-center ${step.iconColor} mb-4`}>
                  <step.icon className="w-6 h-6" />
                </div>

                <h2 className="text-lg font-bold text-foreground mb-2">{step.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  {step.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === currentStep ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {step.nav && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTryIt}
                    data-testid="button-tour-try"
                  >
                    Try It
                  </Button>
                )}

                {currentStep > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    data-testid="button-tour-back"
                  >
                    Back
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={handleNext}
                  data-testid="button-tour-next"
                >
                  {isLast ? "Get Started" : "Next"}
                  {!isLast && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function useTourState() {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_KEY);
    if (!completed) {
      const timer = setTimeout(() => setShowTour(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => setShowTour(true);
  const endTour = () => setShowTour(false);

  return { showTour, startTour, endTour };
}
