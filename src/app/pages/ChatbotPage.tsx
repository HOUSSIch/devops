import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { GlassCard } from "../components/GlassCard";
import { PageTransition } from "../components/PageTransition";
import { BackButton } from "../components/BackButton";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, User, Clock, ShoppingBag, Calendar, Heart, MessageSquare, Plus, Trash2, Menu, X as CloseIcon } from "lucide-react";
import { chatbotService, setChatbotToken } from "../api/chatbot.service";
import { useAuth } from "../contexts/AuthContext"; 

interface BackendMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

export function ChatbotPage() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update token in chatbot service whenever it changes
  useEffect(() => {
    console.log("🔐 Setting chatbot token:", token ? "✓ Token present" : "✗ No token");
    setChatbotToken(token);
  }, [token]);

  // Fetch conversations on mount
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      setError("Please log in to use the chatbot.");
      return;
    }

    const loadConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await chatbotService.getConversations();
        console.log("🔥 Conversations API response:", response);
        // Safety check: ensure we are working with an array
        // This handles both direct arrays and wrapped objects
        const rawData = response;

        if (!Array.isArray(rawData)) {
          console.error("Expected array but received:", response);
          setConversations([]);
          return;
        }

        const transformed = rawData.map((conv) => ({
          id: conv.id,
          title: generateConversationTitle(conv.messages),
          lastMessage: getLastMessage(conv.messages),
          timestamp: new Date(conv.updatedAt),
          messages: transformMessages(conv.messages),
        }));
        
        setConversations(transformed);
        
        if (transformed.length > 0) {
          setCurrentConversationId(transformed[0].id);
        }
      } catch (err) {
        setError("Failed to load conversations.");
        console.error("Error loading conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [isAuthenticated, token]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  const currentConversation = conversations.find((c) => c.id === currentConversationId);
  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const quickActions = [
    { text: "View my routine", icon: Calendar, route: "/routine" },
    { text: "Browse products", icon: ShoppingBag, route: "/products" },
    { text: "Check my progress", icon: Heart, route: "/results" },
  ];

  // Helper function to transform backend messages to frontend format
  const transformMessages = (backendMessages: BackendMessage[]): Message[] => {
    return backendMessages.map((msg, index) => ({
      id: `${index}`,
      text: msg.content,
      sender: msg.role === "assistant" ? "ai" : "user",
      timestamp: new Date(msg.timestamp),
    }));
  };

  // Helper function to generate a title from the first user message
  const generateConversationTitle = (backendMessages: BackendMessage[]): string => {
    const firstUserMessage = backendMessages.find((msg) => msg.role === "user");
    if (!firstUserMessage) return "New Conversation";
    
    const title = firstUserMessage.content.substring(0, 50);
    return title.length < firstUserMessage.content.length ? title + "..." : title;
  };

  // Helper function to get the last message preview
  const getLastMessage = (backendMessages: BackendMessage[]): string => {
    if (backendMessages.length === 0) return "No messages";
    const lastMsg = backendMessages[backendMessages.length - 1];
    const preview = lastMsg.content.substring(0, 50);
    return preview.length < lastMsg.content.length ? preview + "..." : preview;
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isTyping) return;

    try {
      setInputValue("");
      setIsTyping(true);
      setError(null);

      // Send message to backend
      const response = await chatbotService.sendMessage(
        messageText,
        currentConversationId || undefined
      );
console.log("🚀 Send message response:", response);
      // Update conversations with the response
      setConversations((prevConversations) => {
        const updatedConversations = [...prevConversations];
        const convIndex = updatedConversations.findIndex(
          (c) => c.id === response.conversationId
        );

        if (convIndex >= 0) {
          // Update existing conversation
          const updatedMessages = [
            ...updatedConversations[convIndex].messages,
            {
              id: `${updatedConversations[convIndex].messages.length}`,
              text: messageText,
              sender: "user" as const,
              timestamp: new Date(),
            },
            {
              id: `${updatedConversations[convIndex].messages.length + 1}`,
              text: response.message.content,
              sender: "ai" as const,
              timestamp: new Date(response.message.timestamp),
            },
          ];

          const lastMessagePreview = response.message.content.substring(0, 50);
          updatedConversations[convIndex] = {
            ...updatedConversations[convIndex],
            messages: updatedMessages,
            lastMessage:
              lastMessagePreview.length < response.message.content.length
                ? lastMessagePreview + "..."
                : lastMessagePreview,
            timestamp: new Date(),
          };
        } else {
          // Create new conversation
          const newConversation: Conversation = {
            id: response.conversationId,
            title: generateConversationTitle([
              response.userMessage,
              response.message,
            ]),
            lastMessage: getLastMessage([
              response.userMessage,
              response.message,
            ]),
            timestamp: new Date(),
            messages: [
              {
                id: "0",
                text: messageText,
                sender: "user",
                timestamp: new Date(),
              },
              {
                id: "1",
                text: response.message.content,
                sender: "ai",
                timestamp: new Date(response.message.timestamp),
              },
            ],
          };
          updatedConversations.push(newConversation);
        }

        return updatedConversations;
      });

      // Set as current conversation if not already set
      if (!currentConversationId) {
        setCurrentConversationId(response.conversationId);
      }
    } catch (err) {
      setError("Failed to send message. Please try again.");
      console.error("Error sending message:", err);
      setInputValue(text || inputValue); // Restore input on error
    } finally {
      setIsTyping(false);
    }
  };

  const createNewConversation = () => {
    setCurrentConversationId(null);
    setInputValue("");
    setShowHistory(false);
  };

  const deleteConversation = (id: string) => {
    // Remove from local state (backend deletion not implemented)
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <PageTransition direction="fade">
      <div className="min-h-screen bg-[#fbf3fe] dark:bg-[#1a0f2e] p-6 py-12">
        <div className="max-w-7xl mx-auto">
          <BackButton />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#b89de6] flex items-center justify-center pulse-glow">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl text-gray-800 dark:text-white">AI Skincare Assistant</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xl">
              Get personalized advice based on your skin analysis
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid md:grid-cols-3 gap-4 mb-8"
          >
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                onClick={() => navigate(action.route)}
                className="p-4 rounded-2xl glass-card hover:scale-105 transition-all flex items-center gap-3 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b63d3] to-[#b89de6] flex items-center justify-center flex-shrink-0">
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">{action.text}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Main Chat Layout with History Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* History Sidebar - Desktop */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:block lg:col-span-3"
            >
              <GlassCard className="h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-purple-200 dark:border-purple-800">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#8b63d3]" />
                    History
                  </h2>
                  <button
                    onClick={createNewConversation}
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b63d3] to-[#b89de6] flex items-center justify-center hover:scale-110 transition-all"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                  {conversations.map((conv) => (
                    <motion.button
                      key={conv.id}
                      onClick={() => setCurrentConversationId(conv.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all group ${
                        conv.id === currentConversationId
                          ? "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white"
                          : "bg-white/30 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300"
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-sm mb-1 truncate ${
                            conv.id === currentConversationId ? "text-white" : "text-gray-800 dark:text-white"
                          }`}>
                            {conv.title}
                          </h3>
                          <p className={`text-xs truncate ${
                            conv.id === currentConversationId ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                          }`}>
                            {conv.lastMessage}
                          </p>
                          <p className={`text-xs mt-1 ${
                            conv.id === currentConversationId ? "text-white/60" : "text-gray-400 dark:text-gray-500"
                          }`}>
                            {conv.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/20 ${
                            conv.id === currentConversationId ? "text-white" : "text-gray-500"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Mobile History Toggle */}
            <div className="lg:hidden fixed top-24 right-6 z-50">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#b89de6] flex items-center justify-center shadow-lg"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Mobile History Sidebar */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                  onClick={() => setShowHistory(false)}
                >
                  <motion.div
                    initial={{ x: -300 }}
                    animate={{ x: 0 }}
                    exit={{ x: -300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-full w-80 bg-[#fbf3fe] dark:bg-[#1a0f2e] p-6 overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Conversations</h2>
                      <button
                        onClick={() => setShowHistory(false)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/20"
                      >
                        <CloseIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>

                    <button
                      onClick={createNewConversation}
                      className="w-full mb-4 p-3 rounded-xl bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white font-semibold flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      New Conversation
                    </button>

                    <div className="space-y-2">
                      {conversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => {
                            setCurrentConversationId(conv.id);
                            setShowHistory(false);
                          }}
                          className={`w-full text-left p-3 rounded-xl transition-all ${
                            conv.id === currentConversationId
                              ? "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white"
                              : "glass-card text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <h3 className="font-semibold text-sm mb-1">{conv.title}</h3>
                          <p className="text-xs opacity-80 truncate">{conv.lastMessage}</p>
                          <p className="text-xs opacity-60 mt-1">{conv.timestamp.toLocaleDateString()}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-9"
            >
            <GlassCard className="h-[600px] flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
                <AnimatePresence>
                  {loading && !currentConversation ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#b89de6] flex items-center justify-center mx-auto mb-4"
                        >
                          <Sparkles className="w-6 h-6 text-white" />
                        </motion.div>
                        <p className="text-gray-600 dark:text-gray-400">Loading conversations...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>Refresh</Button>
                      </div>
                    </div>
                  ) : currentConversation ? (
                    currentConversation.messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`flex gap-3 ${
                          message.sender === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.sender === "ai"
                              ? "bg-gradient-to-br from-[#8b63d3] to-[#b89de6] pulse-glow"
                              : "bg-purple-100"
                          }`}
                        >
                          {message.sender === "ai" ? (
                            <Sparkles className="w-5 h-5 text-white" />
                          ) : (
                            <User className="w-5 h-5 text-[#8b63d3]" />
                          )}
                        </div>

                        {/* Message Content */}
                        <div
                          className={`flex-1 max-w-[80%] ${
                            message.sender === "user" ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`rounded-2xl px-5 py-3 ${
                              message.sender === "ai"
                                ? "bg-white/50 dark:bg-white/10 text-gray-800 dark:text-white"
                                : "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white"
                            }`}
                          >
                            <p className="whitespace-pre-line">{message.text}</p>
                          </div>

                          <div
                            className={`flex items-center gap-2 mt-1 px-2 text-xs text-gray-500 dark:text-gray-400 ${
                              message.sender === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Sparkles className="w-12 h-12 text-[#8b63d3] mx-auto mb-4 opacity-50" />
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Start a new conversation</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">Send a message to begin chatting with your AI skincare assistant</p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#b89de6] flex items-center justify-center pulse-glow">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white/50 dark:bg-white/10 rounded-2xl px-5 py-3">
                      <div className="flex gap-2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 rounded-full bg-[#8b63d3]"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 rounded-full bg-[#8b63d3]"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 rounded-full bg-[#8b63d3]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-purple-200 dark:border-purple-800 pt-6">
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your skincare..."
                    disabled={isTyping}
                    className="flex-1 px-5 py-3 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-purple-200 dark:border-purple-700 focus:border-[#8b63d3] focus:outline-none focus:ring-2 focus:ring-[#8b63d3]/20 transition-all text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 disabled:opacity-50"
                  />
                  <Button
                    glow
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isTyping}
                    className="px-6"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  This AI assistant uses your skin analysis data to provide personalized
                  recommendations
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
