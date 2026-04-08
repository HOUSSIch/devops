import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/Button";
import { GlassCard } from "../components/GlassCard";
import { PageTransition } from "../components/PageTransition";
import { motion } from "motion/react";
import {
  User, Calendar, Heart, TrendingUp, Sparkles, ShoppingBag,
  Settings, MessageCircle, Package, Award, Clock, ArrowRight,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function DashboardPage() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth() as any;
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comparisonSlider, setComparisonSlider] = useState(50);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:3000/users/dashboard-stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(res.data);
      } catch (err) {
        console.error("Dashboard Fetch Error", err);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchStats();
  }, [token, isAuthenticated]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fbf3fe]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
        <p className="text-purple-600 font-bold tracking-widest uppercase text-xs">Deciphering your skin...</p>
    </div>
  );

  const metrics = dashboardData?.metrics || [];
  const chartData = dashboardData?.chartData || [];
  const improvement = dashboardData?.improvementPercentage || 0;
  const firstName = dashboardData?.firstName || "User";

  return (
    <PageTransition direction="fade">
      <div className="min-h-screen bg-[#fbf3fe] dark:bg-[#1a0f2e] p-6 py-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-5xl text-gray-800 mb-2 font-black tracking-tight uppercase">Welcome Back, {firstName}!</h1>
                <p className="text-gray-500 text-xl font-medium">Your skin is looking better every day </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/profile")} className="flex items-center gap-2 border-2 border-purple-100 rounded-2xl p-4">
                <Settings className="w-5 h-5" /> Settings
              </Button>
            </div>
          </motion.div>

          {/* Visual Improvement Banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <GlassCard className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 p-8">
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-100">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Visual Improvement</h3>
                    <p className="text-gray-600">Your consistent routine is showing clinical results.</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-black text-emerald-600">+{improvement}%</div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mt-1">Total Improvement</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Before/After Comparison Slider */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
            <GlassCard className="p-10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Before & After Comparison</h3>
                  <p className="text-gray-500 text-sm">Real visual tracking of your skin transformation</p>
                </div>
                <div className="flex items-center gap-4 bg-white/60 px-6 py-2 rounded-full border border-white">
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Initial ({dashboardData?.comparison?.beforeDate})</p>
                    <p className="text-sm font-black text-gray-700">Score: {dashboardData?.previousScore}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-400" />
                  <div className="text-left">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Current ({dashboardData?.comparison?.afterDate})</p>
                    <p className="text-sm font-black text-emerald-600">Score: {dashboardData?.currentScore}</p>
                  </div>
                </div>
              </div>

              <div className="relative w-full h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-gray-100">
                {/* Background Image (OLD) */}
                <img src={dashboardData?.comparison?.before || "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=1000"} className="absolute inset-0 w-full h-full object-cover" alt="Before" />
                
                {/* Foreground Image (NEW) */}
                <div className="absolute inset-0 overflow-hidden border-r-2 border-white/50" style={{ width: `${comparisonSlider}%` }}>
                    <img src={dashboardData?.comparison?.after || "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1000"} className="absolute inset-0 w-full h-[500px] object-cover" style={{ width: 'calc(100vw - 48px)', maxWidth: '1200px' }} alt="After" />
                </div>

                {/* Handles */}
                <div className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-20 pointer-events-none" style={{ left: `${comparisonSlider}%` }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-purple-50">
                        <div className="flex gap-0.5"><div className="w-0.5 h-4 bg-purple-300 rounded-full" /><div className="w-0.5 h-4 bg-purple-300 rounded-full" /></div>
                    </div>
                </div>

                <input type="range" min="0" max="100" value={comparisonSlider} onChange={(e) => setComparisonSlider(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
              </div>
            </GlassCard>
          </motion.div>

          {/* Skin Score Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mb-12">
            <GlassCard className="p-10">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Monthly Skin Score Progress</h3>
                <div className="flex items-center gap-2 px-5 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-emerald-600 uppercase">+{improvement}% Trend</span>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="month" stroke="#9ca3af" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} dy={10} />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="score" stroke="#8b63d3" strokeWidth={5} dot={{ fill: "#8b63d3", r: 6, stroke: "#fff", strokeWidth: 3 }} activeDot={{ r: 10 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* Metrics */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {metrics.map((metric: any, index: number) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                <GlassCard hover className="text-center p-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${metric.bgColor} rounded-[1.5rem] mb-6 shadow-sm`}>
                    <TrendingUp className={`w-8 h-8 ${metric.color}`} />
                  </div>
                  <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{metric.label}</h3>
                  <p className="text-4xl font-black text-gray-800">{metric.value}</p>
                  <p className="text-emerald-500 text-[10px] font-black uppercase mt-3">{metric.trend} THIS MONTH</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { n: "Routine", i: Calendar, c: "from-purple-400 to-pink-400", r: "/routine" },
                { n: "Orders", i: Package, c: "from-blue-400 to-cyan-400", r: "/orders" },
                { n: "AI Chat", i: MessageCircle, c: "from-green-400 to-teal-400", r: "/chatbot" },
                { n: "Results", i: Sparkles, c: "from-orange-400 to-rose-400", r: "/results" }
            ].map((a, i) => (
                <button key={i} onClick={() => navigate(a.r)} className="bg-white/80 backdrop-blur-md p-10 rounded-[3rem] shadow-xl hover:scale-105 transition-all text-center border border-white group">
                    <div className={`w-16 h-16 mx-auto rounded-[1.5rem] bg-gradient-to-br ${a.c} flex items-center justify-center text-white mb-6 shadow-lg group-hover:rotate-6 transition-transform`}><a.i size={32} /></div>
                    <h4 className="font-black text-gray-800 text-lg uppercase tracking-tight">{a.n}</h4>
                </button>
            ))}
          </div>

        </div>
      </div>
    </PageTransition>
  );
}