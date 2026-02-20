import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanFace, Sparkles, FileText, ChevronRight, ChevronLeft, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import onboardingVideo from "@/assets/videos/onboarding-hero.mp4";

const features = [
  {
    icon: ScanFace,
    title: "Face Recognition",
    description: "Register and identify faces instantly with smart matching",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: Sparkles,
    title: "AI Face Analysis",
    description: "Detect age, gender, emotion and get fun personality insights",
    gradient: "from-purple-500 to-pink-400",
  },
  {
    icon: FileText,
    title: "Text Summarization",
    description: "Condense long texts into concise summaries with AI",
    gradient: "from-emerald-500 to-teal-400",
  },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex justify-center gap-1.5">
      {[0, 1].map((i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === current ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="h-full flex flex-col"
          >
            <div className="relative flex-1 overflow-hidden">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                data-testid="video-onboarding-hero"
              >
                <source src={onboardingVideo} type="video/mp4" />
              </video>

              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />

              <div className="relative z-10 h-full flex flex-col justify-end pb-10 px-6 max-w-md mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center backdrop-blur-sm border border-primary/30">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                      Powered by AI
                    </span>
                  </div>

                  <h1 className="text-4xl font-bold font-display leading-tight mb-3" data-testid="text-onboarding-title">
                    Frame{" "}
                    <span className="text-gradient">IQ</span>
                  </h1>

                  <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-[300px]" data-testid="text-onboarding-description">
                    Your all-in-one multimodal AI assistant for face recognition, analysis, and intelligent text processing.
                  </p>

                  <div className="mb-5">
                    <StepIndicator current={0} />
                  </div>

                  <Button
                    size="lg"
                    className="w-full rounded-xl gap-2 group"
                    onClick={() => setStep(1)}
                    data-testid="button-onboarding-next"
                  >
                    Explore Features
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full mt-2"
                    onClick={onComplete}
                    data-testid="button-skip-onboarding"
                  >
                    Skip
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="features"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="h-full flex flex-col px-6 max-w-md mx-auto"
          >
            <div className="pt-6">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => setStep(0)}
                data-testid="button-onboarding-back"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </div>

            <div className="flex-1 flex flex-col justify-center py-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-10"
              >
                <h2 className="text-2xl font-bold font-display mb-2" data-testid="text-features-title">
                  What you can do
                </h2>
                <p className="text-sm text-muted-foreground">
                  Three powerful AI tools in one app
                </p>
              </motion.div>

              <div className="space-y-4">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.12 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50"
                    data-testid={`feature-card-${i}`}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-[15px] mb-0.5">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="pb-10 space-y-4">
              <StepIndicator current={1} />
              <Button
                size="lg"
                className="w-full rounded-xl gap-2 group"
                onClick={onComplete}
                data-testid="button-get-started"
              >
                Get Started
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
