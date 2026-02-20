import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export function Card({ children, className, onClick, hoverEffect = false }: CardProps) {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.3)" } : undefined}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "glass-panel rounded-3xl p-6 relative overflow-hidden transition-colors",
        onClick && "cursor-pointer hover:bg-card/90",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-xl font-bold font-display tracking-tight text-white mb-2", className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-muted-foreground text-sm leading-relaxed", className)}>{children}</p>;
}
