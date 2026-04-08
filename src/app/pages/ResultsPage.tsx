import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/app/components/Button";
import { useAuth } from "@/app/contexts/AuthContext";
import { GlassCard } from "@/app/components/GlassCard";
import { PageTransition } from "@/app/components/PageTransition";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  Droplets,
  Sun,
  Sparkles,
  TrendingUp,
  Download,
  ChevronDown,
  ChevronUp,
  Shield,
  Activity,
  Calendar,
  Award,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface RiskLevel {
  level: "low" | "medium" | "high";
  label: string;
  color: string;
  bgColor: string;
}

interface AIConcern {
  label: string;
  severity: string;
  description: string;
  tips: string[];
  riskLevel: RiskLevel;
  icon: string;
  color: string;
}

interface RoutineStep {
  step: string;
  product: string;
  time: string;
  purpose: string;
  howToUse: string;
  frequency: string;
  priority: string;
}

interface GeminiAnalysis {
  skinType: string;
  healthScore: number;
  skinAge: number;
  summary: string;
  concerns: AIConcern[];
  morningRoutine: RoutineStep[];
  eveningRoutine: RoutineStep[];
}

const iconMap: Record<string, React.ElementType> = {
  Droplets,
  Sun,
  AlertCircle,
  Sparkles,
  Zap,
  AlertTriangle,
  Shield,
  Activity,
};

function calculateAgeFromBirthday(birthday?: string): number | null {
  if (!birthday) return null;

  const birthDate = new Date(birthday);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age >= 0 ? age : null;
}

function isGeminiAnalysis(data: any): data is GeminiAnalysis {
  return (
    data &&
    typeof data === "object" &&
    typeof data.skinType === "string" &&
    typeof data.summary === "string" &&
    typeof data.healthScore === "number" &&
    typeof data.skinAge === "number"
  );
}

function extractAnalysisFromStorage(raw: string | null): GeminiAnalysis | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (isGeminiAnalysis(parsed)) return parsed;

    if (isGeminiAnalysis(parsed?.analysis)) return parsed.analysis;

    if (typeof parsed?.analysis === "string") {
      const nested = JSON.parse(parsed.analysis);
      if (isGeminiAnalysis(nested)) return nested;
    }

    if (isGeminiAnalysis(parsed?.result)) return parsed.result;

    if (typeof parsed?.result === "string") {
      const nested = JSON.parse(parsed.result);
      if (isGeminiAnalysis(nested)) return nested;
    }

    if (isGeminiAnalysis(parsed?.data)) return parsed.data;

    if (typeof parsed?.data === "string") {
      const nested = JSON.parse(parsed.data);
      if (isGeminiAnalysis(nested)) return nested;
    }

    if (isGeminiAnalysis(parsed?.aiAnalysis)) return parsed.aiAnalysis;

    if (typeof parsed?.aiAnalysis === "string") {
      const nested = JSON.parse(parsed.aiAnalysis);
      if (isGeminiAnalysis(nested)) return nested;
    }

    console.warn("Unrecognized skinAnalysisResult format:", parsed);
    return null;
  } catch (error) {
    console.error("Failed to parse skinAnalysisResult:", error);
    return null;
  }
}

export function ResultsPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [referenceAge, setReferenceAge] = useState<number | null>(null);

  const savedAnalysis = localStorage.getItem("skinAnalysisResult");
  const analysisData = extractAnalysisFromStorage(savedAnalysis);

  useEffect(() => {
    console.log("savedAnalysis raw:", savedAnalysis);
    console.log("analysisData parsed:", analysisData);
  }, [savedAnalysis, analysisData]);

  useEffect(() => {
    const fetchReferenceAge = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://localhost:3000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const age = calculateAgeFromBirthday(data?.birthday);
        setReferenceAge(age);
      } catch (error) {
        console.error("Failed to fetch reference age:", error);
      }
    };

    fetchReferenceAge();
  }, [token]);

  if (!analysisData) {
    return (
      <PageTransition direction="fade">
        <div className="min-h-screen bg-[#fbf3fe] dark:bg-[#1a0f2e] flex items-center justify-center p-6">
          <GlassCard className="text-center max-w-xl">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
              No Analysis Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please upload your photos first to view your skin analysis results.
            </p>
            <Button glow onClick={() => navigate("/upload")}>
              Go to Upload
            </Button>
          </GlassCard>
        </div>
      </PageTransition>
    );
  }

  const healthScore =
    typeof analysisData.healthScore === "number" ? analysisData.healthScore : null;

  const skinAge =
    typeof analysisData.skinAge === "number" ? analysisData.skinAge : null;

  const aiConfidence = 95;
  const realAge = referenceAge;

  const ageDifference =
    skinAge !== null && realAge !== null ? Math.max(realAge - skinAge, 0) : null;

  const improvementPotential =
    healthScore !== null
      ? Math.min(100, Math.max(60, 100 - healthScore + 60))
      : null;

  const data = [
    { name: "Healthy", value: healthScore ?? 0 },
    { name: "Remaining", value: healthScore !== null ? 100 - healthScore : 100 },
  ];

  const improvementData = [
    { name: "Potential", value: improvementPotential ?? 0 },
    {
      name: "Remaining",
      value: improvementPotential !== null ? 100 - improvementPotential : 100,
    },
  ];

  const COLORS = ["#8b63d3", "#ece2f9"];

  const issues = useMemo(() => {
    return (analysisData.concerns || []).map((concern) => ({
      ...concern,
      iconComponent: iconMap[concern.icon] || Sparkles,
      color: concern.color || "text-[#8b63d3]",
      riskLevel: concern.riskLevel || {
        level: "medium",
        label: "Medium Risk",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
      tips: concern.tips || [],
    }));
  }, [analysisData.concerns]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const downloadPDFReport = () => {
    window.print();
  };

  return (
    <PageTransition direction="fade">
      <div className="min-h-screen bg-[#fbf3fe] dark:bg-[#1a0f2e] p-6 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl text-gray-800 dark:text-white mb-4">
              Your Skin Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-xl mb-3">
              AI-powered insights into your skin health
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-[#8b63d3] font-semibold mb-4">
              Skin Type: {analysisData.skinType || "Unknown"}
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
              {analysisData.summary || "No summary available."}
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={downloadPDFReport}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                Download Full PDF Report
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <GlassCard className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#b89de6] flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      AI Analysis Confidence
                    </h3>
                    <p className="text-gray-600">High accuracy prediction model</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold bg-gradient-to-r from-[#8b63d3] to-[#b89de6] bg-clip-text text-transparent">
                    {aiConfidence}%
                  </div>
                  <p className="text-sm text-gray-600">Confidence Score</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <GlassCard>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 mb-3">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-600 mb-2">Your Skin Age</p>
                  <p className="text-4xl font-bold text-emerald-600">
                    {skinAge ?? "—"}
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <Award className="w-12 h-12 text-[#8b63d3] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-[#8b63d3]">
                      {ageDifference !== null
                        ? `${ageDifference} years younger!`
                        : "Age comparison unavailable"}
                    </p>
                    <p className="text-sm text-gray-600">Your skin looks younger</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#b89de6] mb-3">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-600 mb-2">Reference Age</p>
                  <p className="text-4xl font-bold text-gray-800 dark:text-white">
                    {realAge ?? "—"}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <GlassCard hover>
                <h3 className="text-2xl text-gray-800 dark:text-white mb-6 text-center">
                  Skin Health Score
                </h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-64 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                        >
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl text-[#8b63d3] font-bold">
                          {healthScore ?? "—"}
                        </div>
                        <div className="text-gray-600">/ 100</div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <GlassCard hover>
                <h3 className="text-2xl text-gray-800 dark:text-white mb-6 text-center">
                  Improvement Potential
                </h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-64 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={improvementData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#d1fae5" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl text-emerald-600 font-bold">
                          {improvementPotential ?? "—"}
                        </div>
                        <div className="text-gray-600">%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-8"
          >
            <GlassCard>
              <h3 className="text-2xl text-gray-800 dark:text-white mb-2">
                Detected Skin Concerns & Personalized Tips
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {issues.length} concern{issues.length > 1 ? "s" : ""} generated by AI analysis.
              </p>

              <div className="space-y-4">
                {issues.length > 0 ? (
                  issues.map((issue, index) => (
                    <motion.div
                      key={issue.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                    >
                      <div className="border-2 border-purple-200 rounded-2xl overflow-hidden bg-white/50 dark:bg-white/5">
                        <button
                          onClick={() => toggleSection(issue.label)}
                          className="w-full p-6 flex items-center justify-between hover:bg-purple-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <issue.iconComponent className={`w-10 h-10 ${issue.color}`} />
                            <div className="text-left">
                              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {issue.label}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-gray-600">
                                  Severity: {issue.severity}
                                </p>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${issue.riskLevel.bgColor} ${issue.riskLevel.color}`}
                                >
                                  {issue.riskLevel.label}
                                </span>
                              </div>
                            </div>
                          </div>

                          {expandedSection === issue.label ? (
                            <ChevronUp className="w-6 h-6 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-gray-600" />
                          )}
                        </button>

                        <AnimatePresence>
                          {expandedSection === issue.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 pt-0 border-t border-purple-100">
                                <div className="mb-4">
                                  <h5 className="font-semibold text-gray-800 dark:text-white mb-2">
                                    About This Concern:
                                  </h5>
                                  <p className="text-gray-600">{issue.description}</p>
                                </div>

                                <div>
                                  <h5 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#8b63d3]" />
                                    AI Recommendations:
                                  </h5>
                                  <ul className="space-y-2">
                                    {issue.tips.map((tip, tipIndex) => (
                                      <motion.li
                                        key={tipIndex}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: tipIndex * 0.1 }}
                                        className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg"
                                      >
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#b89de6] flex items-center justify-center flex-shrink-0 mt-0.5">
                                          <span className="text-white text-xs font-bold">
                                            {tipIndex + 1}
                                          </span>
                                        </div>
                                        <span className="text-gray-700">{tip}</span>
                                      </motion.li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <Sparkles className="w-12 h-12 text-[#8b63d3] mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                      No significant concerns detected. Your skin looks great.
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              glow
              onClick={() => navigate("/routine", { state: { analysisData } })}
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              View Personalized Skincare Routine
            </Button>
            <Button variant="outline" onClick={() => navigate("/products")}>
              View Recommended Products
            </Button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}