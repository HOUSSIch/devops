import { useNavigate } from "react-router-dom";
import { Button } from "@/app/components/Button";
import { GlassCard } from "@/app/components/GlassCard";
import { PageTransition } from "@/app/components/PageTransition";
import { motion } from "motion/react";
import { CheckCircle, Package, Sparkles, Heart } from "lucide-react";

export function ConfirmationPage() {
  const navigate = useNavigate();

  return (
    <PageTransition direction="fade">
      <div className="min-h-screen gradient-purple-radial flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto w-full">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            className="text-center mb-8"
          >
            <div className="inline-block p-6 bg-white/20 rounded-full mb-6 pulse-glow">
              <CheckCircle className="w-24 h-24 text-white" strokeWidth={2} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GlassCard className="glass-card-light text-center">
              <h1 className="text-5xl text-gray-800 mb-4">
                Order Confirmed! 🎉
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Your personalized skincare journey starts now ✨
              </p>

              <div className="bg-white/50 rounded-2xl p-6 mb-8">
                <p className="text-gray-700 mb-2">Order Number</p>
                <p className="text-3xl text-[#8b63d3]">#DS-{Math.floor(Math.random() * 100000)}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="p-6 bg-white/50 rounded-2xl"
                >
                  <Package className="w-8 h-8 text-[#8b63d3] mx-auto mb-3" />
                  <h4 className="text-gray-800 mb-1">Fast Shipping</h4>
                  <p className="text-sm text-gray-600">Arrives in 3-5 days</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="p-6 bg-white/50 rounded-2xl"
                >
                  <Sparkles className="w-8 h-8 text-[#8b63d3] mx-auto mb-3" />
                  <h4 className="text-gray-800 mb-1">Free Gift</h4>
                  <p className="text-sm text-gray-600">Included in package</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                  className="p-6 bg-white/50 rounded-2xl"
                >
                  <Heart className="w-8 h-8 text-[#8b63d3] mx-auto mb-3" />
                  <h4 className="text-gray-800 mb-1">Satisfaction</h4>
                  <p className="text-sm text-gray-600">30-day guarantee</p>
                </motion.div>
              </div>

              <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl p-6 mb-8">
                <p className="text-gray-700">
                  📧 A confirmation email has been sent to your inbox with tracking details
                  and your personalized skincare guide.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button glow onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate("/orders")}>
                  Track Order
                </Button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Floating elements */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-20 left-10 opacity-20"
          >
            <Sparkles className="w-16 h-16 text-white" />
          </motion.div>
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute bottom-20 right-10 opacity-20"
          >
            <Heart className="w-16 h-16 text-white" />
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}