import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Recognition from "@/pages/recognition";
import Analysis from "@/pages/analysis";
import Summarize from "@/pages/summarize";
import Onboarding from "@/pages/onboarding";

const ONBOARDING_KEY = "frameiq_onboarding_completed";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/recognition" component={Recognition} />
      <Route path="/analysis" component={Analysis} />
      <Route path="/summarize" component={Summarize} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY)
  );

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary">
          {showOnboarding ? (
            <Onboarding onComplete={completeOnboarding} />
          ) : (
            <Router />
          )}
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
