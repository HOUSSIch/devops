import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "../app/contexts/ThemeContext";
import { AuthProvider, useAuth } from "../app/contexts/AuthContext";
import { CartProvider } from "../app/contexts/CartContext";
import { Toaster } from "sonner";
import { NavigationBar } from "../app/components/NavigationBar";
import { Footer } from "../app/components/Footer";
import { FloatingChatButton } from "../app/components/FloatingChatButton";
import { AccessibilityMenu } from "../app/components/AccessibilityMenu";
import { AdminLoginPage } from "../app/pages/admin/AdminLoginPage";
import { AdminDashboardLayout } from "../app/pages/admin/AdminDashboardLayout";
import { DashboardOverview } from "../app/pages/admin/DashboardOverview";
import { UsersManagement } from "../app/pages/admin/UsersManagement";
import { SkinAnalysisResults } from "../app/pages/admin/SkinAnalysisResults";
import { ProductsManagement } from "../app/pages/admin/ProductsManagement";
import { ReportsAnalytics } from "../app/pages/admin/ReportsAnalytics";
import { AdminSettings } from "../app/pages/admin/AdminSettings";
import AdminEducationPage from "../app/pages/admin/AdminEducationPage";
import { LandingPage } from "../app/pages/LandingPage";
import { CreateAccountPage } from "../app/pages/CreateAccountPage";
import { QuestionnairePage } from "../app/pages/QuestionnairePage";
import { UploadPage } from "../app/pages/UploadPage";
import { ResultsPage } from "../app/pages/ResultsPage";
import { RoutinePage } from "../app/pages/RoutinePage";
import { ProductsPage } from "../app/pages/ProductsPage";
import { CheckoutPage } from "../app/pages/CheckoutPage";
import { ConfirmationPage } from "../app/pages/ConfirmationPage";
import { CartPage } from "../app/pages/CartPage";
import { DashboardPage } from "../app/pages/DashboardPage";
import { ProfilePage } from "../app/pages/ProfilePage";
import { ChatbotPage } from "../app/pages/ChatbotPage";
import { OrdersPage } from "../app/pages/OrdersPage";
import { SignInPage } from "../app/pages/SignInPage";
import { PremiumPage } from "../app/pages/PremiumPage";
import { ActivityPage } from "../app/pages/ActivityPage";
import { OrderDetailsPage } from "../app/pages/OrderDetailsPage";
import { TrackPackagePage } from "../app/pages/TrackPackagePage";
import RemindersPage from "../app/pages/RemindersPage";
import ScannerPage from "../app/pages/ScannerPage";
import EducationPage from "../app/pages/EducationPage";
import RewardsPage from "../app/pages/RewardsPage";
import ProgressTrackerPage from "../app/pages/ProgressTrackerPage";
import { ScrollToTop } from "../app/components/ScrollToTop";
import "@/styles/custom.css";

/** ✅ Admin only */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isInitialized, isAuthenticated, isAdmin } = useAuth();

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#fbf3fe] dark:bg-[#1a0f2e] flex items-center justify-center">
        <div className="bg-white dark:bg-[#2d1b4e] rounded-3xl px-8 py-6 shadow-lg border border-purple-100 dark:border-purple-800/30">
          <p className="text-gray-700 dark:text-gray-200 font-semibold">
            Initializing admin session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

/**
 * ✅ User only
 * NOTE : on NE redirige PAS les admins ici pour que /questionnaire
 * soit accessible juste après l'inscription (avant que les rôles soient assignés)
 */
function UserRoute({ children }: { children: React.ReactNode }) {
  const { isInitialized, isAuthenticated, isAdmin } = useAuth();

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#fbf3fe] dark:bg-[#1a0f2e] flex items-center justify-center">
        <div className="bg-white dark:bg-[#2d1b4e] rounded-3xl px-8 py-6 shadow-lg border border-purple-100 dark:border-purple-800/30">
          <p className="text-gray-700 dark:text-gray-200 font-semibold">
            Initializing user session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;

  return <>{children}</>;
}

/**
 * ✅ Route accessible à tout user authentifié (admin OU user)
 * Utilisée pour /questionnaire uniquement : un nouvel user peut ne pas
 * encore avoir de rôle, ou avoir temporairement le rôle "admin"
 */
function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const { isInitialized, isAuthenticated } = useAuth();

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#fbf3fe] dark:bg-[#1a0f2e] flex items-center justify-center">
        <div className="bg-white dark:bg-[#2d1b4e] rounded-3xl px-8 py-6 shadow-lg border border-purple-100 dark:border-purple-800/30">
          <p className="text-gray-700 dark:text-gray-200 font-semibold">
            Initializing session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/signin" replace />;

  return <>{children}</>;
}

/** Layout wrapper for user pages */
function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavigationBar />
      <main id="main-content" className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
      <FloatingChatButton />
      <AccessibilityMenu />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* ✅ Public */}
      <Route
        path="/"
        element={
          <>
            <NavigationBar />
            <main id="main-content" className="flex-1 pt-20">
              <LandingPage />
            </main>
            <Footer />
            <FloatingChatButton />
            <AccessibilityMenu />
          </>
        }
      />

      {/* ✅ Public logins */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* ✅ /signin */}
      <Route path="/signin" element={<SignInPage />} />

      {/* ✅ Admin protected */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardLayout />
          </AdminRoute>
        }
      >
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="analysis" element={<SkinAnalysisResults />} />
        <Route path="products" element={<ProductsManagement />} />
        <Route path="reports" element={<ReportsAnalytics />} />
        <Route path="education" element={<AdminEducationPage />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* ✅ Public (create account) */}
      <Route
        path="/create-account"
        element={
          <UserLayout>
            <CreateAccountPage />
          </UserLayout>
        }
      />

      {/* ✅ /questionnaire */}
      <Route
        path="/questionnaire"
        element={
          <AuthenticatedRoute>
            <UserLayout>
              <QuestionnairePage />
            </UserLayout>
          </AuthenticatedRoute>
        }
      />

      {/* ✅ User protected */}
      <Route path="/upload" element={<UserRoute><UserLayout><UploadPage /></UserLayout></UserRoute>} />
      <Route path="/results" element={<UserRoute><UserLayout><ResultsPage /></UserLayout></UserRoute>} />
      <Route path="/routine" element={<UserRoute><UserLayout><RoutinePage /></UserLayout></UserRoute>} />
      <Route path="/reminders" element={<UserRoute><UserLayout><RemindersPage /></UserLayout></UserRoute>} />
      <Route path="/scanner" element={<UserRoute><UserLayout><ScannerPage /></UserLayout></UserRoute>} />
      <Route path="/education" element={<UserRoute><UserLayout><EducationPage /></UserLayout></UserRoute>} />
      <Route path="/rewards" element={<UserRoute><UserLayout><RewardsPage /></UserLayout></UserRoute>} />
      <Route path="/progress" element={<UserRoute><UserLayout><ProgressTrackerPage /></UserLayout></UserRoute>} />
      <Route path="/products" element={<UserRoute><UserLayout><ProductsPage /></UserLayout></UserRoute>} />
      <Route path="/cart" element={<UserRoute><UserLayout><CartPage /></UserLayout></UserRoute>} />
      <Route path="/checkout" element={<UserRoute><UserLayout><CheckoutPage /></UserLayout></UserRoute>} />
      <Route path="/confirmation" element={<UserRoute><UserLayout><ConfirmationPage /></UserLayout></UserRoute>} />
      <Route path="/dashboard" element={<UserRoute><UserLayout><DashboardPage /></UserLayout></UserRoute>} />
      <Route path="/profile" element={<UserRoute><UserLayout><ProfilePage /></UserLayout></UserRoute>} />
      <Route path="/orders" element={<UserRoute><UserLayout><OrdersPage /></UserLayout></UserRoute>} />
      <Route path="/order-details" element={<UserRoute><UserLayout><OrderDetailsPage /></UserLayout></UserRoute>} />
      <Route path="/track-package" element={<UserRoute><UserLayout><TrackPackagePage /></UserLayout></UserRoute>} />
      <Route path="/activity" element={<UserRoute><UserLayout><ActivityPage /></UserLayout></UserRoute>} />
      <Route path="/chatbot" element={<UserRoute><UserLayout><ChatbotPage /></UserLayout></UserRoute>} />
      <Route path="/premium" element={<UserRoute><UserLayout><PremiumPage /></UserLayout></UserRoute>} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Toaster position="top-right" richColors />
            <div className="flex flex-col min-h-screen">
              <AppRoutes />
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}