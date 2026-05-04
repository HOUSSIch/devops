import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  to?: string;
  className?: string;
}

export function BackButton({ to, className = "" }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`flex items-center gap-2 text-[#8b63d3] hover:text-[#b89de6] transition-colors ${className}`}
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.95 }}
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Back</span>
    </motion.button>
  );
}
