import { useStats, useAllFaces, useAllSummaries } from "@/hooks/use-api";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanFace, Sparkles, FileText, ArrowRight, History, User, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { OnboardingTour, useTourState } from "@/components/onboarding-tour";

export default function Home() {
  const { data: stats } = useStats();
  const { data: faces } = useAllFaces();
  const { data: summaries } = useAllSummaries();
  const { showTour, startTour, endTour } = useTourState();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const features = [
    {
      href: "/recognition",
      icon: ScanFace,
      title: "Face Recognition",
      description: "Identify or register faces instantly",
      iconColor: "text-blue-400",
    },
    {
      href: "/analysis",
      icon: Sparkles,
      title: "Face Analysis",
      description: "Detect age, gender, emotion & more",
      iconColor: "text-purple-400",
    },
    {
      href: "/summarize",
      icon: FileText,
      title: "Text Summarization",
      description: "Condense long texts with AI power",
      iconColor: "text-emerald-400",
    },
  ];

  return (
    <div className="min-h-screen pb-20 px-4 pt-8 max-w-md mx-auto">
      <header className="mb-6 flex justify-between items-start gap-2">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold font-display text-foreground"
          >
            Frame <span className="text-gradient">IQ</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-sm mt-1"
          >
            Your multimodal AI assistant
          </motion.p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={startTour}
          data-testid="button-replay-tour"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 grid grid-cols-2 gap-3"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <ScanFace className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Faces</span>
            </div>
            <div className="text-2xl font-bold font-display text-foreground" data-testid="text-total-faces">
              {stats?.total_faces || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Summaries</span>
            </div>
            <div className="text-2xl font-bold font-display text-foreground" data-testid="text-total-summaries">
              {stats?.total_summaries || 0}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {features.map((feature) => (
          <motion.div
            key={feature.href}
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
          >
            <Link href={feature.href}>
              <Card className="cursor-pointer hover-elevate">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-md bg-muted flex items-center justify-center ${feature.iconColor} shrink-0`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base mb-0.5">{feature.title}</CardTitle>
                    <CardDescription className="text-xs">{feature.description}</CardDescription>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {((faces && faces.length > 0) || (summaries && summaries.length > 0)) && (
        <div className="mt-8 space-y-6">
          {faces && faces.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Registered Faces</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {faces.slice(0, 6).map((face: any) => (
                  <Card key={face.id} className="shrink-0 min-w-[110px]">
                    <CardContent className="p-3 flex flex-col items-center text-center">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold text-sm mb-1.5">
                        {face.user.name[0]}
                      </div>
                      <p className="text-xs font-medium text-foreground truncate w-full">{face.user.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(face.createdAt).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.section>
          )}

          {summaries && summaries.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recent Summaries</h2>
              </div>
              <div className="space-y-2">
                {summaries.slice(0, 3).map((summary: any) => (
                  <Card key={summary.id}>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-2">"{summary.summary}"</p>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{summary.summaryStyle}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(summary.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      )}

      <OnboardingTour show={showTour} onComplete={endTour} />
      <BottomNav />
    </div>
  );
}
