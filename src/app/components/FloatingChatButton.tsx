import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Sparkles } from "lucide-react";

export function FloatingChatButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  // Don't show on chatbot page
  if (location.pathname === "/chatbot") {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <button
        onClick={() => navigate("/chatbot")}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#b89de6] text-white shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center pulse-glow focus:outline-none focus:ring-4 focus:ring-[#8b63d3]/30"
        aria-label="Open AI chat assistant"
        title="Chat with AI Assistant"
      >
        <AnimatePresence mode="wait">
          {isHovered ? (
            <motion.div
              key="sparkles"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className="w-7 h-7" aria-hidden="true" />
            </motion.div>
          ) : (
            <motion.div
              key="message"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -180 }}
              transition={{ duration: 0.3 }}
            >
              <MessageCircle className="w-7 h-7" aria-hidden="true" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs"
          aria-label="1 new message"
        >
          1
        </motion.div>
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute right-20 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-lg whitespace-nowrap shadow-lg"
            role="tooltip"
          >
            <div className="text-sm">Chat with AI Assistant</div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
              <div className="w-0 h-0 border-l-8 border-l-gray-900 dark:border-l-gray-800 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
