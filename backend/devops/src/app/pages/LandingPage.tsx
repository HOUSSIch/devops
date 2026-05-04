import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/app/components/Button";
import { PageTransition } from "@/app/components/PageTransition";
import { Sparkles, Check, ArrowRight, Users, Zap, Clock, Heart, Lock } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import exampleImage from 'figma:asset/85a503a03641a3da8c665c4d1ae8025c3f3abd02.png';

export function LandingPage() {
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <PageTransition direction="fade">
      <div className="min-h-screen bg-[#fbf3fe] dark:bg-[#1a0f2e]">
        {/* Admin Login Link - Fixed Position */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed top-6 right-6 z-50"
        >
          <Link
            to="/admin/login"
            className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-[#2d1b4e]/90 backdrop-blur-sm rounded-full shadow-lg border border-purple-200 dark:border-purple-700 hover:shadow-xl transition-all text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#8b63d3] dark:hover:text-[#b89de6]"
          >
            <Lock className="w-4 h-4" />
            Admin Login
          </Link>
        </motion.div>

        {/* Premium Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Background with gradient and glow effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#8b63d3] via-[#a78bde] to-[#ece2f9]">
            {/* Glow orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-75" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            {/* Top Branding */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight">
                DeepSkyn
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-white/90" />
                <p className="text-white/90 text-sm tracking-wide uppercase">Powered by AI</p>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              AI-Powered Skin Analysis &<br />
              Personalized Care
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg lg:text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Experience the future of skincare with advanced AI technology that understands your unique skin needs.
            </motion.p>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-8 mb-12"
            >
              {/* Smart Analysis */}
              <div className="flex flex-col items-center gap-3 px-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <p className="text-white font-medium">Smart Analysis</p>
              </div>

              {/* Instant Results */}
              <div className="flex flex-col items-center gap-3 px-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <p className="text-white font-medium">Instant Results</p>
              </div>

              {/* Personalized Care */}
              <div className="flex flex-col items-center gap-3 px-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <p className="text-white font-medium">Personalized Care</p>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <button
                onClick={() => navigate("/questionnaire")}
                className="group relative px-12 py-5 bg-white/95 backdrop-blur-md text-[#8b63d3] rounded-full text-lg font-semibold shadow-2xl hover:shadow-white/25 hover:bg-white transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  Get Started
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </span>
              </button>
            </motion.div>
          </div>

          {/* Bottom fade to background color */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fbf3fe] to-transparent" />
        </section>

        {/* Rest of the page content */}
        <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div {...fadeInUp}>
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Sparkles className="w-4 h-4 text-[#8b63d3]" />
                <span className="text-sm text-gray-700 dark:text-gray-300">AI-Powered Skincare</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl mb-6 text-gray-900 dark:text-white leading-tight">
                Your Skin,<br />
                <span className="text-[#8b63d3]">decoded by AI.</span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                Upload your selfie and receive personalized skin analysis and product recommendations powered by advanced AI technology.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Button
                  glow
                  onClick={() => navigate("/questionnaire")}
                  className="px-8 py-3"
                >
                  Take free Quiz
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="px-8 py-3"
                >
                  View Science
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1631885628966-a14af9faaa9b?w=100&h=100&fit=crop"
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop"
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Trusted by <strong className="text-gray-900 dark:text-white">10,000+</strong> users
                </p>
              </div>
            </motion.div>
            
            {/* Right Content - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 p-6 shadow-2xl max-w-md w-full">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1620485435764-ba7b5ea3804f?w=600"
                  alt="Luxury skincare products"
                  className="w-full h-auto rounded-2xl"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg">
                  <p className="text-xs text-gray-600">AI Analysis</p>
                  <p className="text-base font-semibold text-[#8b63d3]">99.8% Accurate</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <h3 className="text-4xl font-semibold text-[#8b63d3] mb-2">100+</h3>
              <p className="text-gray-600 dark:text-gray-400">AI Models</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <h3 className="text-4xl font-semibold text-[#8b63d3] mb-2">50+</h3>
              <p className="text-gray-600 dark:text-gray-400">Skin Conditions</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <h3 className="text-4xl font-semibold text-[#8b63d3] mb-2">99.8%</h3>
              <p className="text-gray-600 dark:text-gray-400">Accuracy Rate</p>
            </motion.div>
          </div>
        </section>

        {/* Beauty-Tech Innovation Section */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white mb-4">
              Beauty-Tech Innovation
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Cutting-edge AI technology meets personalized skincare
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* AI-Deep Analysis Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-64 bg-gradient-to-br from-gray-900 to-teal-900 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1654430343142-2d6157e69887?w=600"
                  alt="AI Face Analysis"
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  AI-Deep Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our advanced AI analyzes your skin at a molecular level, identifying concerns and tracking changes over time with clinical precision.
                </p>
              </div>
            </motion.div>

            {/* Bespoke Routine Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-64 bg-gradient-to-br from-orange-100 to-orange-200 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1651740896477-467ea46b4fe5?w=600"
                  alt="Bespoke skincare products"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  Bespoke Routine
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Receive a personalized skincare routine tailored to your unique skin profile, lifestyle, and goals.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Molecular Precision Section */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Product Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100 p-8 flex items-center justify-center h-64">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1677726050511-48866c4a64d9?w=400"
                  alt="Skincare bottle"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-teal-400 to-teal-500 p-8 flex items-center justify-center h-64">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1594813591867-02e797aa4581?w=400"
                  alt="Skincare jar"
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>

            {/* Right - Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white mb-6">
                Molecular Precision.<br />
                Luxurious Feel.
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Every ingredient is carefully selected and formulated to work in harmony with your skin's unique chemistry for optimal results.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8b63d3] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Fragrance-free, non-comedogenic</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8b63d3] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Scientifically-backed formulations</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8b63d3] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Clinically-proven active ingredients</p>
                </div>
              </div>

              <button className="flex items-center gap-2 text-[#8b63d3] hover:gap-4 transition-all duration-300 group">
                <span className="font-semibold uppercase tracking-wider text-sm">Discover Ingredients</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white mb-6">
                Decipher your skin's<br />
                secrets today.
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Start your personalized skincare journey
              </p>
              <Button
                glow
                onClick={() => navigate("/questionnaire")}
                className="px-10 py-4 text-lg"
              >
                Start your quiz
              </Button>
            </div>
          </motion.div>
        </section>
      </div>
    </PageTransition>
  );
}