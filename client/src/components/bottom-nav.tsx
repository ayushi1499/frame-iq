import { Home, ScanFace, Sparkles, FileText } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/recognition", icon: ScanFace, label: "Recognize" },
    { href: "/analysis", icon: Sparkles, label: "Analyze" },
    { href: "/summarize", icon: FileText, label: "Summarize" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="max-w-md mx-auto flex justify-between items-center gap-1 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center px-4 py-1.5 rounded-md cursor-pointer transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-muted rounded-md"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <item.icon className={cn("w-5 h-5 relative z-10 mb-0.5", isActive && "stroke-[2.5px]")} />
                <span className={cn(
                  "text-[10px] font-medium relative z-10",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
