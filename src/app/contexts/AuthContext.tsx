import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import keycloak from "../contexts/keycloak";

type Role = "admin" | "user";
type SubscriptionTier = "FREE" | "SILVER" | "GOLD" | "PLATINUM";

interface AuthContextType {
  isInitialized: boolean;
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  roles: string[];
  isAdmin: boolean;
  subscriptionTier: SubscriptionTier;
  hasRole: (role: Role) => boolean;
  login: (redirectTo?: string) => void;
  logout: () => void;
  refreshNow: () => Promise<boolean>;
  syncProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ URL du backend Railway (à remplacer par votre vraie URL)
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://devops-backend-production.up.railway.app";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`Keycloak init timeout after ${ms}ms`));
    }, ms);

    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [subscriptionTier, setSubscriptionTier] =
    useState<SubscriptionTier>("FREE");

  const didInitialSyncRef = useRef(false);

  const syncFromKeycloak = useCallback(() => {
    const auth = !!keycloak.authenticated;
    setIsAuthenticated(auth);
    setToken(keycloak.token ?? null);

    const parsed: any = keycloak.tokenParsed ?? {};
    setUsername(parsed.preferred_username ?? parsed.email ?? null);

    const realmRoles: string[] = parsed?.realm_access?.roles ?? [];
    setRoles(realmRoles);
  }, []);

  // ✅ Correction : Utilise BACKEND_URL au lieu de localhost
  const syncUserToBackend = useCallback(async () => {
    if (!keycloak.authenticated || !keycloak.token) return;

    try {
      console.log("🔄 Syncing user with backend:", BACKEND_URL);
      
      const response = await fetch(`${BACKEND_URL}/users/sync-me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "sync-me failed");
      }
      
      console.log("✅ User synced successfully");
    } catch (e) {
      console.error("❌ sync-me failed:", e);
    }
  }, []);

  // ✅ Correction : Utilise BACKEND_URL au lieu de localhost
  const syncProfile = useCallback(async () => {
    if (!keycloak.authenticated || !keycloak.token) return;

    try {
      console.log("🔄 Fetching user profile from:", BACKEND_URL);
      
      const response = await fetch(`${BACKEND_URL}/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch user profile");
      }

      setSubscriptionTier((data?.subscriptionTier || "FREE") as SubscriptionTier);
      console.log("✅ Profile fetched, subscription tier:", data?.subscriptionTier);
    } catch (e) {
      console.error("❌ syncProfile failed:", e);
    }
  }, []);

  const refreshNow = useCallback(async () => {
    try {
      if (!keycloak.authenticated) return false;

      const refreshed = await keycloak.updateToken(30);

      syncFromKeycloak();

      if (keycloak.authenticated) {
        await syncProfile();
      }

      return refreshed;
    } catch (e) {
      console.error("refreshNow failed:", e);
      return false;
    }
  }, [syncFromKeycloak, syncProfile]);

  useEffect(() => {
    let interval: number | undefined;
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log("🚀 Starting Keycloak init...");
        console.log("🔗 Keycloak URL:", keycloak.endpoint);

        await withTimeout(
          keycloak.init({
            onLoad: "check-sso",
            pkceMethod: "S256",
            checkLoginIframe: false,
            silentCheckSsoRedirectUri:
              window.location.origin + "/silent-check-sso.html",
          }),
          8000,
        );

        console.log("✅ Keycloak init success");

        if (!mounted) return;

        syncFromKeycloak();

        if (keycloak.authenticated) {
          console.log("👤 User is authenticated");
          console.log("📋 Roles from token:", roles);
          
          if (!didInitialSyncRef.current) {
            await syncUserToBackend();
            didInitialSyncRef.current = true;
          }

          await syncProfile();
        } else {
          console.log("👤 User is not authenticated");
        }

        interval = window.setInterval(() => {
          if (keycloak.authenticated) {
            refreshNow();
          }
        }, 20000);

        keycloak.onTokenExpired = () => {
          console.log("🔄 Token expired, refreshing...");
          refreshNow();
        };
      } catch (error) {
        console.error("❌ Keycloak init failed or timed out:", error);

        if (!mounted) return;

        setIsAuthenticated(false);
        setToken(null);
        setUsername(null);
        setRoles([]);
        setSubscriptionTier("FREE");
      } finally {
        if (mounted) {
          console.log("✅ Auth provider initialized");
          setIsInitialized(true);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (interval) window.clearInterval(interval);
    };
  }, [refreshNow, syncFromKeycloak, syncProfile, syncUserToBackend, roles]);

  const isAdmin = roles.includes("admin");

  const value = useMemo<AuthContextType>(() => {
    return {
      isInitialized,
      isAuthenticated,
      token,
      username,
      roles,
      isAdmin,
      subscriptionTier,
      hasRole: (role: Role) => roles.includes(role),
      login: (redirectTo?: string) =>
        keycloak.login({
          redirectUri: redirectTo
            ? window.location.origin + redirectTo
            : window.location.origin,
        }),
      logout: () =>
        keycloak.logout({
          redirectUri: window.location.origin,
        }),
      refreshNow,
      syncProfile,
    };
  }, [
    isInitialized,
    isAuthenticated,
    token,
    username,
    roles,
    isAdmin,
    subscriptionTier,
    refreshNow,
    syncProfile,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
