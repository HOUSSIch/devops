import React from "react";
import { Outlet } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import App from "../app/App";

const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
}));

function makePage(label: string) {
  return function MockPage() {
    return <div>{label}</div>;
  };
}

vi.mock("../app/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => mockUseAuth(),
}));

vi.mock("../app/contexts/ThemeContext", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../app/contexts/CartContext", () => ({
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../app/components/NavigationBar", () => ({
  NavigationBar: makePage("navigation-bar"),
}));

vi.mock("../app/components/Footer", () => ({
  Footer: makePage("footer"),
}));

vi.mock("../app/components/FloatingChatButton", () => ({
  FloatingChatButton: makePage("floating-chat-button"),
}));

vi.mock("../app/components/AccessibilityMenu", () => ({
  AccessibilityMenu: makePage("accessibility-menu"),
}));

vi.mock("../app/components/ScrollToTop", () => ({
  ScrollToTop: makePage("scroll-to-top"),
}));

vi.mock("../app/pages/LandingPage", () => ({
  LandingPage: makePage("landing-page"),
}));

vi.mock("../app/pages/SignInPage", () => ({
  SignInPage: makePage("sign-in-page"),
}));

vi.mock("../app/pages/ProductsPage", () => ({
  ProductsPage: makePage("products-page"),
}));

vi.mock("../app/pages/CartPage", () => ({
  CartPage: makePage("cart-page"),
}));

vi.mock("../app/pages/DashboardPage", () => ({
  DashboardPage: makePage("dashboard-page"),
}));

vi.mock("../app/pages/CreateAccountPage", () => ({
  CreateAccountPage: makePage("create-account-page"),
}));

vi.mock("../app/pages/QuestionnairePage", () => ({
  QuestionnairePage: makePage("questionnaire-page"),
}));

vi.mock("../app/pages/UploadPage", () => ({
  UploadPage: makePage("upload-page"),
}));

vi.mock("../app/pages/ResultsPage", () => ({
  ResultsPage: makePage("results-page"),
}));

vi.mock("../app/pages/RoutinePage", () => ({
  RoutinePage: makePage("routine-page"),
}));

vi.mock("../app/pages/CheckoutPage", () => ({
  CheckoutPage: makePage("checkout-page"),
}));

vi.mock("../app/pages/ConfirmationPage", () => ({
  ConfirmationPage: makePage("confirmation-page"),
}));

vi.mock("../app/pages/ProfilePage", () => ({
  ProfilePage: makePage("profile-page"),
}));

vi.mock("../app/pages/ChatbotPage", () => ({
  ChatbotPage: makePage("chatbot-page"),
}));

vi.mock("../app/pages/OrdersPage", () => ({
  OrdersPage: makePage("orders-page"),
}));

vi.mock("../app/pages/PremiumPage", () => ({
  PremiumPage: makePage("premium-page"),
}));

vi.mock("../app/pages/ActivityPage", () => ({
  ActivityPage: makePage("activity-page"),
}));

vi.mock("../app/pages/OrderDetailsPage", () => ({
  OrderDetailsPage: makePage("order-details-page"),
}));

vi.mock("../app/pages/TrackPackagePage", () => ({
  TrackPackagePage: makePage("track-package-page"),
}));

vi.mock("../app/pages/admin/AdminLoginPage", () => ({
  AdminLoginPage: makePage("admin-login-page"),
}));

vi.mock("../app/pages/admin/AdminDashboardLayout", () => ({
  AdminDashboardLayout: () => (
    <div>
      admin-dashboard-layout
      <Outlet />
    </div>
  ),
}));

vi.mock("../app/pages/admin/DashboardOverview", () => ({
  DashboardOverview: makePage("dashboard-overview"),
}));

vi.mock("../app/pages/admin/UsersManagement", () => ({
  UsersManagement: makePage("users-management"),
}));

vi.mock("../app/pages/admin/SkinAnalysisResults", () => ({
  SkinAnalysisResults: makePage("skin-analysis-results"),
}));

vi.mock("../app/pages/admin/ProductsManagement", () => ({
  ProductsManagement: makePage("products-management"),
}));

vi.mock("../app/pages/admin/ReportsAnalytics", () => ({
  ReportsAnalytics: makePage("reports-analytics"),
}));

vi.mock("../app/pages/admin/AdminSettings", () => ({
  AdminSettings: makePage("admin-settings"),
}));

vi.mock("../app/pages/admin/AdminEducationPage", () => ({
  default: makePage("admin-education-page"),
}));

vi.mock("../app/pages/RemindersPage", () => ({
  default: makePage("reminders-page"),
}));

vi.mock("../app/pages/ScannerPage", () => ({
  default: makePage("scanner-page"),
}));

vi.mock("../app/pages/EducationPage", () => ({
  default: makePage("education-page"),
}));

vi.mock("../app/pages/RewardsPage", () => ({
  default: makePage("rewards-page"),
}));

vi.mock("../app/pages/ProgressTrackerPage", () => ({
  default: makePage("progress-tracker-page"),
}));

beforeEach(() => {
  window.history.pushState({}, "", "/");
  mockUseAuth.mockReturnValue({
    isInitialized: true,
    isAuthenticated: false,
    token: null,
    username: null,
    roles: [],
    isAdmin: false,
    subscriptionTier: "FREE",
    hasRole: () => false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshNow: vi.fn(),
    syncProfile: vi.fn(),
  });
});

function renderAppAt(pathname: string) {
  window.history.pushState({}, "", pathname);
  return render(<App />);
}

describe("App routing", () => {
  test("renders the public home shell on the landing route", () => {
    renderAppAt("/");

    expect(screen.getByText("navigation-bar")).toBeInTheDocument();
    expect(screen.getByText("landing-page")).toBeInTheDocument();
    expect(screen.getByText("footer")).toBeInTheDocument();
    expect(screen.getByText("floating-chat-button")).toBeInTheDocument();
    expect(screen.getByText("accessibility-menu")).toBeInTheDocument();
  });

  test("redirects unauthenticated users away from protected user routes", async () => {
    renderAppAt("/cart");

    expect(await screen.findByText("sign-in-page")).toBeInTheDocument();
  });

  test("redirects authenticated non-admin users away from admin routes", async () => {
    mockUseAuth.mockReturnValue({
      isInitialized: true,
      isAuthenticated: true,
      token: "token",
      username: "alex",
      roles: ["user"],
      isAdmin: false,
      subscriptionTier: "FREE",
      hasRole: () => true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshNow: vi.fn(),
      syncProfile: vi.fn(),
    });

    renderAppAt("/admin/dashboard");

    expect(await screen.findByText("dashboard-page")).toBeInTheDocument();
  });

  test("renders the admin dashboard when the user is an admin", async () => {
    mockUseAuth.mockReturnValue({
      isInitialized: true,
      isAuthenticated: true,
      token: "token",
      username: "admin",
      roles: ["admin"],
      isAdmin: true,
      subscriptionTier: "PLATINUM",
      hasRole: () => true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshNow: vi.fn(),
      syncProfile: vi.fn(),
    });

    renderAppAt("/admin/dashboard");

    expect(await screen.findByText("admin-dashboard-layout")).toBeInTheDocument();
    expect(screen.getByText("dashboard-overview")).toBeInTheDocument();
  });
});