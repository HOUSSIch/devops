import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PageTransition } from "../components/PageTransition";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// ─── Décode le JWT pour lire les claims ───────────────────────────────────
function parseJwt(token: string): Record<string, any> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

// ─── Clé localStorage pour marquer les users qui ont fait le questionnaire ─
const QUESTIONNAIRE_DONE_KEY = "deepskyn_questionnaire_done";

// Vérifie si ce user (par son sub Keycloak) a déjà fait le questionnaire
function hasCompletedQuestionnaire(sub: string): boolean {
  try {
    const done = JSON.parse(localStorage.getItem(QUESTIONNAIRE_DONE_KEY) || "[]");
    return Array.isArray(done) && done.includes(sub);
  } catch {
    return false;
  }
}

// ─── Fonction exportée à appeler depuis QuestionnairePage quand terminé ────
// À appeler à la fin du questionnaire :
//   import { markQuestionnaireComplete } from "../pages/SignInPage";
//   markQuestionnaireComplete(sub);
export function markQuestionnaireComplete(sub: string): void {
  try {
    const done = JSON.parse(localStorage.getItem(QUESTIONNAIRE_DONE_KEY) || "[]");
    if (!done.includes(sub)) {
      done.push(sub);
      localStorage.setItem(QUESTIONNAIRE_DONE_KEY, JSON.stringify(done));
    }
  } catch {
    localStorage.setItem(QUESTIONNAIRE_DONE_KEY, JSON.stringify([sub]));
  }
}

export function SignInPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, roles, token } = useAuth();
  const isAdmin = roles.includes("admin");

  // ✅ Non connecté → redirection automatique vers Keycloak
  useEffect(() => {
    if (!isAuthenticated) {
      login();
    }
  }, []);

  // ✅ Connecté → redirection selon si nouveau ou ancien compte
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const claims = parseJwt(token);
    const sub = claims.sub as string | undefined;

    if (!sub) {
      // Pas de sub dans le token → fallback dashboard
      navigate(isAdmin ? "/admin/dashboard" : "/dashboard", { replace: true });
      return;
    }

    if (!hasCompletedQuestionnaire(sub)) {
      // ✅ Nouveau compte (ou questionnaire jamais fait) → Questionnaire
      navigate("/questionnaire", { replace: true });
    } else {
      // ✅ Compte existant → Dashboard selon le rôle
      navigate(isAdmin ? "/admin/dashboard" : "/dashboard", { replace: true });
    }
  }, [isAuthenticated, token, isAdmin, navigate]);

  return (
    <PageTransition direction="fade">
      <div className="min-h-screen bg-[#fbf3fe] dark:bg-gray-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-8 focus:outline-none focus:ring-2 focus:ring-[#8b63d3] rounded-lg px-2 py-1"
            aria-label="DeepSkyn Home"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#b89de6] flex items-center justify-center pulse-glow">
              <Sparkles className="w-7 h-7 text-white" aria-hidden="true" />
            </div>
            <span className="text-3xl text-gray-800 dark:text-white">DeepSkyn</span>
          </Link>

          <div className="flex flex-col items-center gap-4">
            <div
              className="w-10 h-10 border-4 border-[#8b63d3] border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Redirection en cours...
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
