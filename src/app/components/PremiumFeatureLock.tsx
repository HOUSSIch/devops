import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "./Button";
import { PageTransition } from "./PageTransition";
import { motion } from "motion/react";

interface PremiumFeatureLockProps {
  featureName: string;
  description: string;
  currentPlan: string;
  requiredPlan: string;
  onUpgrade?: () => void;
}

export function PremiumFeatureLock({
  featureName,
  description,
  currentPlan,
  requiredPlan,
  onUpgrade,
}: PremiumFeatureLockProps) {
  const navigate = useNavigate();

  return (
    <PageTransition direction="fade">
      <div className="min-h-screen bg-gradient-to-br from-[#fbf3fe] via-purple-50 to-pink-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-12 text-center border border-white/60 shadow-2xl relative overflow-hidden">
            {/* Decorative gradient line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8b63d3] to-transparent opacity-30" />

            {/* Lock Icon */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative mb-8 inline-block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] rounded-full blur-xl opacity-40" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#c9b0e4] to-[#a78dce] flex items-center justify-center shadow-xl">
                <Lock strokeWidth={1.5} className="text-white" size={44} />
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
              {featureName}
            </h1>

            {/* Subtitle */}
            <p className="text-gray-500 mb-6 leading-relaxed font-medium text-center">
              {description}
            </p>

            {/* Current Plan Badge */}
            <div className="bg-purple-50 border border-purple-100 rounded-2xl px-6 py-3 mb-8 inline-block">
              <p className="text-[11px] text-gray-400 font-black uppercase tracking-wider mb-1">
                Current Plan
              </p>
              <p className="text-xl font-black text-[#8b63d3] uppercase tracking-wider">
                {currentPlan}
              </p>
            </div>

            {/* Required Plan Info */}
            <div className="bg-white/50 border border-white rounded-2xl px-8 py-6 mb-8">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
                Upgrade Required
              </p>
              <p className="text-sm text-gray-600 mb-3">
                This feature is available on
              </p>
              <p className="text-2xl font-black text-[#8b63d3]">{requiredPlan}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <Button
                glow
                onClick={() => {
                  if (onUpgrade) {
                    onUpgrade();
                  } else {
                    navigate("/premium");
                  }
                }}
                className="w-full px-8 py-4 text-base font-bold rounded-2xl shadow-xl shadow-purple-100"
              >
                Upgrade Now ✨
              </Button>

              <button
                onClick={() => navigate("/premium")}
                className="text-[#8b63d3] hover:text-[#7a5ac5] font-semibold text-sm transition-colors"
              >
                Compare plans and pricing
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
