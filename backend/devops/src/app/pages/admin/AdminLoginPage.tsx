import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { PageTransition } from "../../components/PageTransition";
import { motion } from "motion/react";
import { Mail, Lock, AlertCircle, Sparkles, Eye, EyeOff } from "lucide-react";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, logout, isAuthenticated, roles } = useAuth();

  // rôle admin = "admin" (realm role)
  const isAdmin = roles.includes("admin");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ⚠️ Ces champs ne servent plus en PKCE (Keycloak gère le login)
  const [email, setEmail] = useState("admin@deepskyn.com");
  const [password, setPassword] = useState("admin123");

  useEffect(() => {
    if (!isAuthenticated) return;

    // Si connecté et admin -> dashboard admin
    if (isAdmin) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    // Si connecté mais PAS admin -> on bloque l'accès admin
    setError("Accès refusé : vous n’êtes pas Admin.");
    // Option 1 (recommandé): déconnecter pour éviter confusion
    // logout();
    // Option 2: juste rediriger vers user
    // navigate("/dashboard", { replace: true });
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ PKCE: redirection vers Keycloak (pas de email/pass)
      // Après login Keycloak revient ici et le guard redirige
      login();
    } catch (err: any) {
      setError(err?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <PageTransition direction="fade">
      <div className="min-h-screen bg-gradient-to-br from-[#fbf3fe] via-white to-[#ece2f9] dark:from-[#1a0f2e] dark:to-[#2d1b4e] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <circle cx="25" cy="25" r="1" fill="#8b63d3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full blur-2xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-md z-10"
        >
          <div className="bg-white/80 dark:bg-[#2d1b4e]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-800/30 p-8 md:p-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#8b63d3] to-[#b89de6] rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                Admin Login
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Authentification via Keycloak
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </motion.div>
              )}

              {/* Champs gardés pour UI, mais désactivés (PKCE) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Email Address (géré par Keycloak)
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    disabled
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-2xl opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Password (géré par Keycloak)
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    disabled
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-2xl opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#8b63d3] to-[#b89de6] hover:from-[#7a52c2] hover:to-[#a78cd5] text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    Sign In (Keycloak)
                    <Lock className="w-5 h-5" />
                  </>
                )}
              </button>

              {isAuthenticated && !isAdmin && (
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full border-2 border-red-400 text-red-600 py-3 rounded-2xl"
                >
                  Logout
                </button>
              )}
            </motion.form>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}