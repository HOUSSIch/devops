import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Accessibility, Moon, Sun, Type, Globe, X } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export function AdminAccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, textSize, setTextSize } = useTheme();
  const [language, setLanguage] = useState<"en" | "es" | "fr" | "de">("en");

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen]);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
  ] as const;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 group">
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Open accessibility menu (Alt + A)"
          title="Open accessibility menu (Alt + A)"
        >
          <Accessibility className="w-6 h-6" />
        </motion.button>

        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Press Alt + A
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#2d1b4e] shadow-2xl z-50 overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="accessibility-title"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] rounded-xl flex items-center justify-center">
                      <Accessibility className="w-6 h-6 text-white" />
                    </div>
                    <h2 id="accessibility-title" className="text-2xl font-bold text-gray-800 dark:text-white">
                      Accessibility
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                    aria-label="Close accessibility menu"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Theme */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {theme === "dark" ? (
                        <Moon className="w-6 h-6 text-[#8b63d3]" />
                      ) : (
                        <Sun className="w-6 h-6 text-[#8b63d3]" />
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Theme Mode</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred theme</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === "light"
                          ? "border-[#8b63d3] bg-purple-100 dark:bg-purple-900/40"
                          : "border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600"
                      }`}
                    >
                      <Sun className="w-6 h-6 text-[#8b63d3]" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">Light</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === "dark"
                          ? "border-[#8b63d3] bg-purple-100 dark:bg-purple-900/40"
                          : "border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600"
                      }`}
                    >
                      <Moon className="w-6 h-6 text-[#8b63d3]" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">Dark</span>
                    </button>
                  </div>
                </div>

                {/* Text size (utilise ThemeContext) */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Type className="w-6 h-6 text-[#8b63d3]" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">Text Size</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Adjust text size</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(["small", "medium", "large", "extra-large"] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setTextSize(size)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          textSize === size
                            ? "border-[#8b63d3] bg-purple-100 dark:bg-purple-900/40"
                            : "border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600"
                        }`}
                      >
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">
                          {size}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">Aa</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Globe className="w-6 h-6 text-[#8b63d3]" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">Language</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Select preferred language</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setLanguage(lang.code)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          language === lang.code
                            ? "border-[#8b63d3] bg-purple-100 dark:bg-purple-900/40"
                            : "border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600"
                        }`}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{lang.name}</span>
                        {language === lang.code && <span className="ml-auto text-[#8b63d3] font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}