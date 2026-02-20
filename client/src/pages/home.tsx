import { useState } from "react";
import { useStats, useAllFaces, useAllSummaries } from "@/hooks/use-api";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanFace, Sparkles, FileText, ArrowRight, History, User, HelpCircle, Heart, ChevronDown, ChevronUp, Video } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingTour, useTourState } from "@/components/onboarding-tour";

export default function Home() {
  const { data: stats } = useStats();
  const { data: faces } = useAllFaces();
  const { data: summaries } = useAllSummaries();
  const { showTour, startTour, endTour } = useTourState();
  const [showStory, setShowStory] = useState(false);
  const [showScript, setShowScript] = useState(false);

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

      <div className="mt-8 space-y-3">
        <Card className="overflow-hidden">
          <button
            className="w-full text-left"
            onClick={() => setShowStory(!showStory)}
            data-testid="button-toggle-story"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-rose-400 shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">Why We Built This</p>
                <p className="text-xs text-muted-foreground">The story behind Frame IQ</p>
              </div>
              {showStory ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
            </CardContent>
          </button>
          <AnimatePresence>
            {showStory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Frame IQ started as a simple question: <span className="text-foreground font-medium">What if AI could truly understand faces the way humans do?</span>
                  </p>
                  <p>
                    Most face recognition tools rely on rigid mathematical models that break down with different lighting, angles, or expressions. We wanted something smarter -- a system that uses the same kind of visual reasoning a human would.
                  </p>
                  <p>
                    By combining <span className="text-foreground font-medium">Google's Gemini AI</span> with multimodal image analysis, Frame IQ doesn't just compare pixels. It understands facial structure -- the shape of a jawline, the spacing between eyes, the curve of a nose -- and makes intelligent comparisons across multiple photos.
                  </p>
                  <p>
                    We expanded the vision beyond recognition. Face Analysis gives you age, emotion, and ethnicity detection with fun personalized facts. Text Summarization lets you condense articles, notes, or reports with customizable styles.
                  </p>
                  <p>
                    Frame IQ is built for everyone -- students, professionals, curious minds -- anyone who wants to see what happens when you put AI in their hands. <span className="text-foreground font-medium">No complexity, no jargon, just powerful tools that work.</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <Card className="overflow-hidden">
          <button
            className="w-full text-left"
            onClick={() => setShowScript(!showScript)}
            data-testid="button-toggle-script"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-cyan-400 shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">Demo Video Script</p>
                <p className="text-xs text-muted-foreground">2-minute walkthrough for 2 presenters</p>
              </div>
              {showScript ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
            </CardContent>
          </button>
          <AnimatePresence>
            {showScript && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-4 text-sm leading-relaxed">
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Scene 1 -- Intro (0:00 - 0:20)</p>
                    <p className="text-foreground font-medium mb-1">Person A:</p>
                    <p className="text-muted-foreground">"Hey everyone! Ever wished your phone could recognize faces, analyze expressions, and summarize text -- all in one app?"</p>
                    <p className="text-foreground font-medium mt-2 mb-1">Person B:</p>
                    <p className="text-muted-foreground">"That's exactly what Frame IQ does. It's an AI-powered productivity tool built with Google's Gemini AI. Let us show you how it works."</p>
                  </div>

                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Scene 2 -- Face Registration (0:20 - 0:45)</p>
                    <p className="text-foreground font-medium mb-1">Person A:</p>
                    <p className="text-muted-foreground">"First, let's register a face. I'll open the Face Recognition tab, switch to 'Register New,' and either take a live photo or upload one. I'll type in my name and hit Register."</p>
                    <p className="text-muted-foreground mt-1 italic">[Shows the registration flow on screen]</p>
                    <p className="text-foreground font-medium mt-2 mb-1">Person B:</p>
                    <p className="text-muted-foreground">"The app saves a high-quality display image and processes the face data behind the scenes. It's stored securely in the database, ready for recognition."</p>
                  </div>

                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Scene 3 -- Face Recognition (0:45 - 1:10)</p>
                    <p className="text-foreground font-medium mb-1">Person B:</p>
                    <p className="text-muted-foreground">"Now the exciting part -- recognition. I'll take a photo of Person A. The app sends the image along with all registered faces to Gemini AI."</p>
                    <p className="text-foreground font-medium mt-2 mb-1">Person A:</p>
                    <p className="text-muted-foreground">"Unlike traditional systems that compare pixels, Gemini actually understands facial features -- jawline, eye spacing, nose shape. It ranks every registered face by similarity. And if someone isn't registered, it tells you 'No Match Found' and prompts you to register."</p>
                  </div>

                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Scene 4 -- Face Analysis (1:10 - 1:35)</p>
                    <p className="text-foreground font-medium mb-1">Person A:</p>
                    <p className="text-muted-foreground">"Next up, Face Analysis. Upload any face photo, and AI detects the estimated age, gender, emotion, and ethnicity -- with confidence percentages."</p>
                    <p className="text-foreground font-medium mt-2 mb-1">Person B:</p>
                    <p className="text-muted-foreground">"My favorite part is the 'Fun Facts' section -- the AI generates three personalized, entertaining observations based on what it sees. Like noticing your smile, your style, or even your accessories!"</p>
                  </div>

                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Scene 5 -- Text Summarization (1:35 - 1:50)</p>
                    <p className="text-foreground font-medium mb-1">Person B:</p>
                    <p className="text-muted-foreground">"Frame IQ isn't just about faces. Paste any long text -- an article, lecture notes, a report -- pick your style: concise, detailed, or bullet points. Choose your max length, and AI generates a clean summary in seconds."</p>
                    <p className="text-foreground font-medium mt-2 mb-1">Person A:</p>
                    <p className="text-muted-foreground">"All your summaries are saved in history, so you can always come back to them."</p>
                  </div>

                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Scene 6 -- Tech & Closing (1:50 - 2:00)</p>
                    <p className="text-foreground font-medium mb-1">Person A:</p>
                    <p className="text-muted-foreground">"Under the hood: React and TypeScript on the frontend, Express and PostgreSQL on the backend, and Google Gemini AI powering all the intelligence."</p>
                    <p className="text-foreground font-medium mt-2 mb-1">Person B:</p>
                    <p className="text-muted-foreground">"Frame IQ -- face recognition, analysis, and summarization, all powered by AI. Thanks for watching!"</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      <OnboardingTour show={showTour} onComplete={endTour} />
      <BottomNav />
    </div>
  );
}
