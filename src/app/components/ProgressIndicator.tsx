import { motion } from "motion/react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-purple-600">Step {currentStep} / {totalSteps}</span>
        <span className="text-sm text-purple-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
      </div>
      <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #8b63d3 0%, #b89de6 100%)" }}
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between mt-4">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <motion.div
            key={index}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
              index + 1 <= currentStep
                ? "bg-gradient-to-br from-[#8b63d3] to-[#b89de6] text-white"
                : "bg-purple-100 text-purple-400"
            }`}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            {index + 1 > currentStep ? (
              index + 1
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
