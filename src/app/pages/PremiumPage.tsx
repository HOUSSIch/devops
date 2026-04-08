import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { PageTransition } from "../components/PageTransition";
import { motion } from "motion/react";
import {
  Check,
  Crown,
  Star,
  Zap,
  Sparkles,
  Camera,
  Bell,
  TrendingUp,
  Scan,
  BookOpen,
  Award,
  Gift,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import axios from "axios";

type PremiumTier = "free" | "silver" | "gold" | "platinum";

interface PremiumPlan {
  id: PremiumTier;
  name: string;
  price: string;
  photoLimit: number;
  icon: any;
  color: string;
  bgGradient: string;
  glowColor: string;
  features: { name: string; icon: any }[];
  popular?: boolean;
}

export function PremiumPage() {
  const navigate = useNavigate();
  const { token, subscriptionTier, syncProfile } = useAuth() ;

  const currentTier = ((subscriptionTier || "FREE") as string).toLowerCase() as PremiumTier;

  const [selectedTier, setSelectedTier] = useState<PremiumTier>("gold");
  const [isLoading, setIsLoading] = useState(false);

  const premiumPlans: PremiumPlan[] = useMemo(
    () => [
      {
        id: "free",
        name: "Free",
        price: "$0",
        photoLimit: 1,
        icon: Gift,
        color: "text-blue-600",
        bgGradient: "from-blue-400 to-blue-600",
        glowColor: "shadow-blue-400/50",
        features: [
          { name: "Facial Analysis (1 image)", icon: Camera },
          { name: "My Routine Reminders", icon: Bell },
        ],
      },
      {
        id: "silver",
        name: "Silver",
        price: "$29",
        photoLimit: 2,
        icon: Star,
        color: "text-gray-700",
        bgGradient: "from-gray-300 to-gray-500",
        glowColor: "shadow-gray-400/50",
        features: [
          { name: "Facial Analysis (2 images)", icon: Camera },
          { name: "My Routine Reminders", icon: Bell },
          { name: "Progress Tracker", icon: TrendingUp },
        ],
      },
      {
        id: "gold",
        name: "Gold",
        price: "$49",
        photoLimit: 3,
        icon: Crown,
        color: "text-yellow-600",
        bgGradient: "from-yellow-400 to-yellow-600",
        glowColor: "shadow-yellow-400/50",
        popular: true,
        features: [
          { name: "Facial Analysis (3 images)", icon: Camera },
          { name: "My Routine Reminders", icon: Bell },
          { name: "Progress Tracker", icon: TrendingUp },
          { name: "Ingredient Scanner", icon: Scan },
          { name: "Education Hub", icon: BookOpen },
        ],
      },
      {
        id: "platinum",
        name: "Platinum",
        price: "$79",
        photoLimit: 5,
        icon: Zap,
        color: "text-purple-600",
        bgGradient: "from-[#8b63d3] to-[#b89de6]",
        glowColor: "shadow-purple-400/50",
        features: [
          { name: "Facial Analysis (5 images)", icon: Camera },
          { name: "My Routine Reminders", icon: Bell },
          { name: "Progress Tracker", icon: TrendingUp },
          { name: "Ingredient Scanner", icon: Scan },
          { name: "Education Hub", icon: BookOpen },
          { name: "Rewards Program", icon: Award },
        ],
      },
    ],
    [],
  );

  const selectedPlan = premiumPlans.find((p) => p.id === selectedTier)!;

 const handleUpgrade = async () => {
  if (selectedTier === currentTier) {
    toast.info("You are already on this plan.");
    return;
  }

  if (!token) {
    toast.error("You must be logged in to upgrade.");
    return;
  }

  setIsLoading(true);
  const toastId = toast.loading(`Upgrading to ${selectedPlan.name}...`);

  try {
    await axios.patch(
      "http://localhost:3000/users/subscription",
      { tier: selectedTier.toUpperCase() },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    toast.success(`Successfully upgraded to ${selectedPlan.name}! 🎉`, {
      id: toastId,
    });

    if (syncProfile) {
      await syncProfile();
    }

    setTimeout(() => navigate("/dashboard"), 1500);
  } catch (error: any) {
    console.error(error);
    const errorMsg =
      error?.response?.data?.message || "Payment failed. Please try again.";
    toast.error(errorMsg, { id: toastId });
  } finally {
    setIsLoading(false);
  }
};
  return (
    <PageTransition direction="fade">
      <div className="min-h-screen bg-[#fbf3fe] p-6 pt-24 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white mb-6 shadow-lg"
            >
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">
                Premium Membership
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">
              Choose Your Plan
            </h1>

            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Unlock professional AI skin analysis and personalized routines designed for your unique needs.
            </p>

            <div className="mt-8 inline-flex items-center gap-3 bg-white/60 backdrop-blur-md border border-white px-6 py-2.5 rounded-full shadow-sm">
              <span className="text-gray-400 text-sm font-medium">Current Plan:</span>
              <span className="text-[#8b5cf6] font-bold uppercase tracking-wider">
                {currentTier}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {premiumPlans.map((plan, index) => {
              const isSelected = selectedTier === plan.id;
              const isCurrent = currentTier === plan.id;

              return (
                <motion.button
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedTier(plan.id)}
                  className={`relative w-full rounded-[2.5rem] p-8 text-left transition-all duration-300 bg-white/70 backdrop-blur-md border border-white/60 shadow-xl ${
                    isSelected
                      ? "ring-4 ring-[#8b63d3] shadow-2xl scale-105"
                      : "hover:scale-[1.02]"
                  }`}
                  type="button"
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#8b63d3] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl z-10">
                      Most Popular
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-8">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.bgGradient} flex items-center justify-center text-white shadow-lg`}
                    >
                      <plan.icon size={28} />
                    </div>

                    {isSelected && (
                      <div className="bg-[#8b63d3] rounded-full p-1.5 shadow-md">
                        <Check className="text-white" size={16} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{plan.name}</h3>

                  <div className="flex items-baseline mb-8">
                    <span className="text-4xl font-bold text-[#8b63d3]">{plan.price}</span>
                    <span className="text-gray-400 text-xs ml-1 font-semibold uppercase">
                      / month
                    </span>
                  </div>

                  <ul className="space-y-4 mb-10">
                    {plan.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-[11px] font-bold text-gray-500 uppercase tracking-tight"
                      >
                        <div className="bg-purple-50 p-1 rounded-md">
                          <f.icon size={14} className="text-[#8b63d3]" />
                        </div>
                        {f.name}
                      </li>
                    ))}
                  </ul>

                  <div
                    className={`w-full py-3.5 rounded-2xl text-center text-xs font-black uppercase tracking-widest transition-colors ${
                      isSelected
                        ? "bg-[#8b63d3] text-white shadow-lg shadow-purple-200"
                        : "bg-purple-50 text-[#8b63d3]"
                    }`}
                  >
                    {isCurrent ? "Current" : isSelected ? "Selected" : "Select Plan"}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/40 backdrop-blur-2xl rounded-[3rem] p-12 text-center border border-white/60 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8b63d3] to-transparent opacity-30" />

              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Ready to upgrade to {selectedPlan.name}?
              </h2>

              <p className="text-gray-500 mb-12 max-w-lg mx-auto leading-relaxed font-medium">
                Unlock advanced skin insights and track your transformation with our premium AI engine.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/70 p-5 rounded-[2rem] border border-white/50 shadow-sm">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                    Monthly Price
                  </p>
                  <p className="text-2xl font-black text-[#8b63d3]">{selectedPlan.price}</p>
                </div>

                <div className="bg-white/70 p-5 rounded-[2rem] border border-white/50 shadow-sm">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                    Photo Uploads
                  </p>
                  <p className="text-2xl font-black text-[#8b63d3]">
                    Up to {selectedPlan.photoLimit}
                  </p>
                </div>

                <div className="bg-white/70 p-5 rounded-[2rem] border border-white/50 shadow-sm">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                    Billing
                  </p>
                  <p className="text-2xl font-black text-[#8b63d3]">Monthly</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Button
                  glow
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="px-14 py-5 text-base font-bold rounded-2xl shadow-xl shadow-purple-100"
                >
                  {isLoading ? "Processing..." : `Upgrade to ${selectedPlan.name} `}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="px-14 py-5 text-base font-bold rounded-2xl border-purple-100 text-[#8b63d3] hover:bg-white"
                >
                  Maybe Later
                </Button>
              </div>

              <p className="mt-8 text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">
                Cancel anytime • No hidden fees • 30-day money-back guarantee
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}