import { motion, type HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary" | "outline";
  glow?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  glow = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "px-8 py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white hover:shadow-lg",
    secondary: "bg-white/50 text-[#8b63d3] hover:bg-white/80",
    outline:
      "border-2 border-[#8b63d3] text-[#8b63d3] hover:bg-[#8b63d3] hover:text-white",
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${
        glow ? "glow-button" : ""
      } ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}