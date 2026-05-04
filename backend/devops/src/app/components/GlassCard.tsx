import { motion } from "motion/react";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = "", hover = false }: GlassCardProps) {
  return (
    <motion.div
      className={`glass-card rounded-3xl p-8 ${className}`}
      whileHover={hover ? { scale: 1.02, boxShadow: "0 12px 40px rgba(139, 99, 211, 0.2)" } : {}}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
