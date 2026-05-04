import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { GlassCard } from "../components/GlassCard";
import { PageTransition } from "../components/PageTransition";
import { motion } from "motion/react";
import {
  Sun,
  Moon,
  Droplets,
  Sparkles,
  Shield,
  Heart,
  Info,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

type RoutineStep = {
  step: string;
  product: string;
  time: string;
  purpose: string;
  howToUse: string;
  frequency: string;
  priority: "high" | "medium" | "low";
};

type Concern = {
  label: string;
  severity: "Mild" | "Moderate" | "High";
  description: string;
};

type AnalysisResult = {
  skinType: string;
  healthScore: number;
  skinAge: number;
  summary: string;
  concerns: Concern[];
  morningRoutine: RoutineStep[];
  eveningRoutine: RoutineStep[];
};

const getStepIcon = (step: string) => {
  const name = step.toLowerCase();

  if (
    name.includes("cleanser") ||
    name.includes("cleaning") ||
    name.includes("cleanse")
  ) {
    return Droplets;
  }

  if (
    name.includes("toner") ||
    name.includes("exfoliant") ||
    name.includes("tone")
  ) {
    return Sparkles;
  }

  if (name.includes("serum") || name.includes("treat")) {
    return Heart;
  }

  if (
    name.includes("sunscreen") ||
    name.includes("spf") ||
    name.includes("protection") ||
    name.includes("protect")
  ) {
    return Shield;
  }

  if (
    name.includes("moisturizer") ||
    name.includes("cream") ||
    name.includes("hydrate") ||
    name.includes("moisturize")
  ) {
    return Droplets;
  }

  return Sparkles;
};

const getPriorityBadge = (priority: "high" | "medium" | "low") => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700";
    case "medium":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-green-100 text-green-700";
  }
};

const getApproxMinutes = (time: string) => {
  const lower = time.toLowerCase();
  const minuteMatch = lower.match(/(\d+)\s*min/);
  if (minuteMatch) return parseInt(minuteMatch[1], 10) || 0;

  const secondMatch = lower.match(/(\d+)\s*sec/);
  if (secondMatch) {
    const seconds = parseInt(secondMatch[1], 10) || 0;
    return Math.max(1, Math.round(seconds / 60));
  }

  return 1;
};

const unwrap = (raw: any): any => raw?.data ?? raw;

export function RoutinePage() {
  const navigate = useNavigate();
  const { token, isAuthenticated, isInitialized, login, refreshNow } = useAuth();

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchLatestAnalysis = async () => {
      if (!isInitialized) return;

      if (!isAuthenticated) {
        setLoading(false);
        setErrorMessage("Please log in first.");
        return;
      }

      try {
        await refreshNow();

        if (!token) {
          throw new Error("Authentication token is missing");
        }

        const response = await fetch("http://localhost:3000/ai/my-latest-analysis", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const raw = await response.json();

        if (!response.ok) {
          throw new Error(
            typeof raw?.message === "string"
              ? raw.message
              : raw?.error || "Failed to load routine",
          );
        }

        const data = unwrap(raw);

        if (!data) {
          setAnalysis(null);
          setErrorMessage("No analysis found. Please upload a photo first.");
          return;
        }

        const normalizedAnalysis: AnalysisResult = {
          skinType: data.skinType,
          healthScore: data.healthScore,
          skinAge: data.skinAge,
          summary: data.summary,
          concerns: Array.isArray(data.concerns) ? data.concerns : [],
          morningRoutine: Array.isArray(data.morningRoutine) ? data.morningRoutine : [],
          eveningRoutine: Array.isArray(data.eveningRoutine) ? data.eveningRoutine : [],
        };

        setAnalysis(normalizedAnalysis);
        setErrorMessage("");
      } catch (error: any) {
        console.error("Failed to fetch latest analysis:", error);

        const fallback = localStorage.getItem("skinAnalysisResult");
        if (fallback) {
          try {
            const data = unwrap(JSON.parse(fallback));
            if (data) {
              setAnalysis(data);
              setErrorMessage("");
            } else {
              setErrorMessage(error?.message || "Failed to load routine");
            }
          } catch {
            setErrorMessage(error?.message || "Failed to load routine");
          }
        } else {
          setErrorMessage(error?.message || "Failed to load routine");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLatestAnalysis();
  }, [isAuthenticated, isInitialized, token, refreshNow]);

  const morningRoutine = analysis?.morningRoutine || [];
  const nightRoutine = analysis?.eveningRoutine || [];

  const totalMorningTime = morningRoutine.reduce(
    (total, item) => total + getApproxMinutes(item.time),
    0,
  );

  const totalNightTime = nightRoutine.reduce(
    (total, item) => total + getApproxMinutes(item.time),
    0,
  );

  return (
    <PageTransition direction="left">
      <div className="min-h-screen bg-[#fbf3fe] p-6 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl text-gray-800 mb-4">
              Your Personalized Routine
            </h1>
            <p className="text-gray-600 text-xl">
              Follow these AI-generated steps for optimal skin health
            </p>
          </motion.div>

          {loading ? (
            <GlassCard className="text-center py-12">
              <div className="w-14 h-14 rounded-full border-4 border-[#8b63d3] border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-gray-700">Loading your personalized routine...</p>
            </GlassCard>
          ) : !analysis ? (
            <GlassCard className="text-center">
              <p className="text-gray-700 mb-4">
                {errorMessage || "No analysis found. Please upload a photo first."}
              </p>
              {!isAuthenticated ? (
                <Button onClick={() => login("/routine")}>Log in</Button>
              ) : (
                <Button onClick={() => navigate("/upload")}>Go to Upload</Button>
              )}
            </GlassCard>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <GlassCard className="bg-white/60">
                  <div className="grid md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500">Skin Type</p>
                      <p className="text-xl text-gray-800 font-semibold">
                        {analysis.skinType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Health Score</p>
                      <p className="text-xl text-gray-800 font-semibold">
                        {analysis.healthScore}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estimated Skin Age</p>
                      <p className="text-xl text-gray-800 font-semibold">
                        {analysis.skinAge}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Summary</p>
                      <p className="text-sm text-gray-700">{analysis.summary}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <GlassCard>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl">
                        <Sun className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl text-gray-800">Morning Routine</h2>
                        <p className="text-gray-600">Start your day right</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {morningRoutine.length > 0 ? (
                        morningRoutine.map((item, index) => {
                          const Icon = getStepIcon(item.step);

                          return (
                            <motion.div
                              key={`${item.step}-${index}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                              className="p-4 bg-white/50 rounded-2xl border border-purple-200 hover:border-[#8b63d3] transition-all"
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 bg-gradient-to-br from-[#8b63d3] to-[#b89de6] rounded-xl flex items-center justify-center text-white">
                                    <Icon className="w-5 h-5" />
                                  </div>
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className="text-gray-800 font-medium">
                                      {item.step}
                                    </h4>
                                    <span
                                      className={`text-xs px-3 py-1 rounded-full ${getPriorityBadge(
                                        item.priority,
                                      )}`}
                                    >
                                      {item.priority} priority
                                    </span>
                                  </div>

                                  <p className="text-sm text-[#8b63d3] font-semibold mb-1">
                                    {item.product}
                                  </p>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {item.purpose}
                                  </p>

                                  <div className="space-y-1 text-xs text-gray-500">
                                    <p>
                                      <strong>How to use:</strong> {item.howToUse}
                                    </p>
                                   
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <p className="text-gray-500">
                          No morning routine generated.
                        </p>
                      )}
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50/50 rounded-xl border border-yellow-200">
                      <p className="text-sm text-gray-700">
                        ⏱ <strong>Total time:</strong> About {totalMorningTime} minutes
                      </p>
                    </div>
                  </GlassCard>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <GlassCard>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
                        <Moon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl text-gray-800">Night Routine</h2>
                        <p className="text-gray-600">Repair while you sleep</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {nightRoutine.length > 0 ? (
                        nightRoutine.map((item, index) => {
                          const Icon = getStepIcon(item.step);

                          return (
                            <motion.div
                              key={`${item.step}-${index}`}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                              className="p-4 bg-white/50 rounded-2xl border border-purple-200 hover:border-[#8b63d3] transition-all"
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                                    <Icon className="w-5 h-5" />
                                  </div>
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className="text-gray-800 font-medium">
                                      {item.step}
                                    </h4>
                                    <span
                                      className={`text-xs px-3 py-1 rounded-full ${getPriorityBadge(
                                        item.priority,
                                      )}`}
                                    >
                                      {item.priority} priority
                                    </span>
                                  </div>

                                  <p className="text-sm text-[#8b63d3] font-semibold mb-1">
                                    {item.product}
                                  </p>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {item.purpose}
                                  </p>

                                  <div className="space-y-1 text-xs text-gray-500">
                                    <p>
                                      <strong>How to use:</strong> {item.howToUse}
                                    </p>
                                   
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <p className="text-gray-500">No night routine generated.</p>
                      )}
                    </div>

                    <div className="mt-6 p-4 bg-purple-50/50 rounded-xl border border-purple-200">
                      <p className="text-sm text-gray-700">
                        ⏱ <strong>Total time:</strong> About {totalNightTime} minutes
                      </p>
                    </div>
                  </GlassCard>
                </motion.div>
              </div>

              {analysis.concerns?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="mb-8"
                >
                  <GlassCard className="bg-gradient-to-r from-purple-50/50 to-pink-50/50">
                    <h3 className="text-2xl text-gray-800 mb-4">Skin Concerns</h3>
                    <div className="space-y-3">
                      {analysis.concerns.map((concern, index) => (
                        <div
                          key={`${concern.label}-${index}`}
                          className="p-4 bg-white/60 rounded-xl border border-purple-100"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-gray-800 font-medium">
                              {concern.label}
                            </h4>
                            <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                              {concern.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {concern.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mb-8"
              >
                <GlassCard className="bg-gradient-to-r from-purple-50/50 to-pink-50/50">
                  <h3 className="text-2xl text-gray-800 mb-4"> Pro Tips</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-[#8b63d3] mt-1">•</span>
                      <span>
                        Always apply products from thinnest to thickest consistency.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#8b63d3] mt-1">•</span>
                      <span>
                        Wait 30-60 seconds between each product for better absorption.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#8b63d3] mt-1">•</span>
                      <span>Don't forget your neck and décolletage.</span>
                    </li>
                  </ul>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="text-center"
              >
                <Button glow onClick={() => navigate("/products")}>
                  See Recommended Products
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}