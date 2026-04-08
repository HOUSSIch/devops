import { useState } from "react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings,
  Sun,
  Moon,
  Contrast,
  Type,
  Check,
  X,
} from "lucide-react";
import { GlassCard } from "./GlassCard";

export function AccessibilityMenu() {
  const { theme, setTheme, textSize, setTextSize } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions = [
    { value: "light", label: "Light Mode", icon: Sun, description: "Bright and airy" },
    { value: "dark", label: "Dark Mode", icon: Moon, description: "Purple luxury theme" },
    { value: "high-contrast", label: "High Contrast", icon: Contrast, description: "Maximum readability" },
  ] as const;

  const textSizeOptions = [
    { value: "small", label: "Small", size: "14px" },
    { value: "medium", label: "Medium", size: "16px" },
    { value: "large", label: "Large", size: "18px" },
    { value: "extra-large", label: "Extra Large", size: "20px" },
  ] as const;

  return (
    <>
      {/* Floating Accessibility Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#b89de6] dark:from-[#b89de6] dark:to-[#c4b5fd] text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center pulse-glow"
        aria-label="Open accessibility settings"
      >
        <Settings className="w-6 h-6" />
      </motion.button>

      {/* Accessibility Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4"
            >
              <GlassCard className="bg-white dark:bg-[#2d1b4e] high-contrast:bg-black border-2 border-purple-200 dark:border-[#b89de6] high-contrast:border-white">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#b89de6] flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 high-contrast:text-white">
                        Accessibility
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300 high-contrast:text-white">
                        Customize your experience
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 high-contrast:hover:bg-gray-800 flex items-center justify-center transition-colors"
                    aria-label="Close accessibility settings"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-300 high-contrast:text-white" />
                  </button>
                </div>

                {/* Theme Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 high-contrast:text-white mb-4 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-[#8b63d3] dark:text-[#b89de6] high-contrast:text-yellow-400" />
                    Theme
                  </h3>
                  <div className="space-y-3">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          theme === option.value
                            ? "border-[#8b63d3] dark:border-[#b89de6] high-contrast:border-yellow-400 bg-purple-50 dark:bg-purple-900/30 high-contrast:bg-gray-900"
                            : "border-purple-200 dark:border-purple-800 high-contrast:border-white hover:border-purple-300 dark:hover:border-purple-700 bg-white/30 dark:bg-purple-900/10 high-contrast:bg-black"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              theme === option.value
                                ? "bg-gradient-to-br from-[#8b63d3] to-[#b89de6] text-white"
                                : "bg-purple-100 dark:bg-purple-800 high-contrast:bg-gray-800 text-[#8b63d3] dark:text-[#b89de6] high-contrast:text-yellow-400"
                            }`}>
                              <option.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-gray-100 high-contrast:text-white">
                                {option.label}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 high-contrast:text-gray-300">
                                {option.description}
                              </p>
                            </div>
                          </div>
                          {theme === option.value && (
                            <Check className="w-5 h-5 text-[#8b63d3] dark:text-[#b89de6] high-contrast:text-yellow-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Size Selection */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 high-contrast:text-white mb-4 flex items-center gap-2">
                    <Type className="w-5 h-5 text-[#8b63d3] dark:text-[#b89de6] high-contrast:text-yellow-400" />
                    Text Size
                  </h3>
                  <div className="space-y-3">
                    {textSizeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTextSize(option.value)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          textSize === option.value
                            ? "border-[#8b63d3] dark:border-[#b89de6] high-contrast:border-yellow-400 bg-purple-50 dark:bg-purple-900/30 high-contrast:bg-gray-900"
                            : "border-purple-200 dark:border-purple-800 high-contrast:border-white hover:border-purple-300 dark:hover:border-purple-700 bg-white/30 dark:bg-purple-900/10 high-contrast:bg-black"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="font-bold text-[#8b63d3] dark:text-[#b89de6] high-contrast:text-yellow-400"
                              style={{ fontSize: option.size }}
                            >
                              Aa
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-gray-100 high-contrast:text-white">
                                {option.label}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 high-contrast:text-gray-300">
                                {option.size} base size
                              </p>
                            </div>
                          </div>
                          {textSize === option.value && (
                            <Check className="w-5 h-5 text-[#8b63d3] dark:text-[#b89de6] high-contrast:text-yellow-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/30 high-contrast:bg-gray-900 rounded-xl border border-purple-200 dark:border-purple-800 high-contrast:border-white">
                  <p className="text-sm text-gray-700 dark:text-gray-300 high-contrast:text-white">
                    <strong>Tip:</strong> Your preferences are automatically saved and will be
                    remembered on your next visit.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
