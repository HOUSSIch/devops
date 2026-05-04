import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import {
  Menu,
  X,
  Sun,
  Moon,
  Contrast,
  User,
  ShoppingBag,
  MessageCircle,
  Home,
  Package,
  LayoutDashboard,
  LogIn,
  LogOut,
  Sparkles,
  Upload,
  Droplets,
  Crown,
  Bell,
  Scan,
  GraduationCap,
  Trophy,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

export function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mainNavLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  const featuresLinks = [
    { path: "/upload", label: "Facial Analysis", icon: Upload },
    { path: "/routine", label: "My Routine", icon: Droplets },
    { path: "/reminders", label: "Reminders", icon: Bell },
    { path: "/scanner", label: "Ingredient Scanner", icon: Scan },
    { path: "/progress", label: "Progress Tracker", icon: TrendingUp },
  ];

  const learnEarnLinks = [
    { path: "/education", label: "Education Hub", icon: GraduationCap },
    { path: "/rewards", label: "Rewards", icon: Trophy },
  ];

  const shopLinks = [
    { path: "/products", label: "Products", icon: ShoppingBag },
    { path: "/orders", label: "My Orders", icon: Package },
  ];

  const getThemeIcon = () => {
    if (theme === "dark") return <Moon className="w-5 h-5" aria-hidden="true" />;
    if (theme === "high-contrast") return <Contrast className="w-5 h-5" aria-hidden="true" />;
    return <Sun className="w-5 h-5" aria-hidden="true" />;
  };

  const getThemeLabel = () => {
    if (theme === "dark") return "Dark Mode";
    if (theme === "high-contrast") return "High Contrast";
    return "Light Mode";
  };

  const isPathActive = (paths: { path: string }[]) => {
    return paths.some((link) => location.pathname === link.path);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg"
          : "bg-white dark:bg-gray-900 shadow-sm"
      } border-b border-purple-100 dark:border-gray-800`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#8b63d3] rounded-lg px-2 py-1"
            aria-label="DeepSkyn Home"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#b89de6] flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-[#8b63d3] to-[#b89de6] bg-clip-text text-transparent">
              DeepSkyn
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Home - toujours visible */}
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#8b63d3] ${
                location.pathname === "/"
                  ? "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
              }`}
              aria-current={location.pathname === "/" ? "page" : undefined}
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>Home</span>
            </Link>

            {/* Liens visibles uniquement si authentifié */}
            {isAuthenticated && (
              <>
                {/* Dashboard */}
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#8b63d3] ${
                    location.pathname === "/dashboard"
                      ? "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
                  }`}
                  aria-current={location.pathname === "/dashboard" ? "page" : undefined}
                >
                  <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                  <span>Dashboard</span>
                </Link>

                {/* Features Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setOpenDropdown("features")}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#8b63d3] ${
                      isPathActive(featuresLinks)
                        ? "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
                    }`}
                    aria-expanded={openDropdown === "features"}
                    aria-haspopup="true"
                  >
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    <span>Features</span>
                    <ChevronDown className="w-3 h-3" aria-hidden="true" />
                  </button>
                  <AnimatePresence>
                    {openDropdown === "features" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-purple-100 dark:border-gray-700 overflow-hidden"
                      >
                        {featuresLinks.map((link) => {
                          const Icon = link.icon;
                          const isActive = location.pathname === link.path;
                          return (
                            <Link
                              key={link.path}
                              to={link.path}
                              className={`flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                                isActive
                                  ? "bg-purple-50 dark:bg-gray-700 text-[#8b63d3]"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700"
                              }`}
                            >
                              <Icon className="w-4 h-4" aria-hidden="true" />
                              <span>{link.label}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Learn & Earn Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setOpenDropdown("learn")}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#8b63d3] ${
                      isPathActive(learnEarnLinks)
                        ? "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
                    }`}
                    aria-expanded={openDropdown === "learn"}
                    aria-haspopup="true"
                  >
                    <GraduationCap className="w-4 h-4" aria-hidden="true" />
                    <span>Learn & Earn</span>
                    <ChevronDown className="w-3 h-3" aria-hidden="true" />
                  </button>
                  <AnimatePresence>
                    {openDropdown === "learn" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-purple-100 dark:border-gray-700 overflow-hidden"
                      >
                        {learnEarnLinks.map((link) => {
                          const Icon = link.icon;
                          const isActive = location.pathname === link.path;
                          return (
                            <Link
                              key={link.path}
                              to={link.path}
                              className={`flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                                isActive
                                  ? "bg-purple-50 dark:bg-gray-700 text-[#8b63d3]"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700"
                              }`}
                            >
                              <Icon className="w-4 h-4" aria-hidden="true" />
                              <span>{link.label}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Shop Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setOpenDropdown("shop")}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#8b63d3] ${
                      isPathActive(shopLinks)
                        ? "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
                    }`}
                    aria-expanded={openDropdown === "shop"}
                    aria-haspopup="true"
                  >
                    <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                    <span>Shop</span>
                    <ChevronDown className="w-3 h-3" aria-hidden="true" />
                  </button>
                  <AnimatePresence>
                    {openDropdown === "shop" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-purple-100 dark:border-gray-700 overflow-hidden"
                      >
                        {shopLinks.map((link) => {
                          const Icon = link.icon;
                          const isActive = location.pathname === link.path;
                          return (
                            <Link
                              key={link.path}
                              to={link.path}
                              className={`flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                                isActive
                                  ? "bg-purple-50 dark:bg-gray-700 text-[#8b63d3]"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700"
                              }`}
                            >
                              <Icon className="w-4 h-4" aria-hidden="true" />
                              <span>{link.label}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* AI Assistant */}
                <Link
                  to="/chatbot"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#8b63d3] ${
                    location.pathname === "/chatbot"
                      ? "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>AI Assistant</span>
                </Link>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Boutons visibles uniquement si authentifié */}
            {isAuthenticated && (
              <>
                <button
                  onClick={() => navigate("/premium")}
                  className="hidden lg:flex items-center gap-1.5 px-4 py-2 text-sm bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white rounded-lg hover:shadow-xl hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-[#8b63d3] font-medium"
                  aria-label="Upgrade to Premium"
                >
                  <Crown className="w-4 h-4" aria-hidden="true" />
                  <span>Premium</span>
                </button>

                <button
                  onClick={() => navigate("/cart")}
                  className="hidden lg:flex items-center gap-2 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b63d3]"
                  aria-label="Shopping cart"
                >
                  <ShoppingBag className="w-5 h-5 text-gray-700 dark:text-gray-300" aria-hidden="true" />
                </button>

                <button
                  onClick={() => navigate("/profile")}
                  className="hidden lg:flex items-center gap-2 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b63d3]"
                  aria-label="User profile"
                >
                  <User className="w-5 h-5 text-gray-700 dark:text-gray-300" aria-hidden="true" />
                </button>
              </>
            )}

            {/* Theme Toggle - toujours visible */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b63d3]"
              aria-label={`Switch to next theme. Current theme: ${getThemeLabel()}`}
              title={getThemeLabel()}
            >
              {getThemeIcon()}
            </button>

            {/* Sign In / Logout - toujours visible */}
            {isAuthenticated ? (
              <button
                onClick={() => logout()}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/signin")}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b63d3]"
                aria-label="Sign in to your account"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b63d3]"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden pb-4 overflow-hidden border-t border-purple-100 dark:border-gray-800"
              role="menu"
            >
              <div className="flex flex-col gap-2 pt-4">
                {/* Home - toujours visible */}
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#8b63d3] ${
                    location.pathname === "/"
                      ? "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
                  }`}
                  role="menuitem"
                  aria-current={location.pathname === "/" ? "page" : undefined}
                >
                  <Home className="w-5 h-5" aria-hidden="true" />
                  <span>Home</span>
                </Link>

                {/* Liens visibles uniquement si authentifié */}
                {isAuthenticated && (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#8b63d3] ${
                        location.pathname === "/dashboard"
                          ? "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
                      }`}
                      role="menuitem"
                    >
                      <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
                      <span>Dashboard</span>
                    </Link>

                    <div className="mt-2">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Features
                      </div>
                      {featuresLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#8b63d3] ${
                              isActive
                                ? "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white"
                                : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
                            }`}
                            role="menuitem"
                          >
                            <Icon className="w-5 h-5" aria-hidden="true" />
                            <span>{link.label}</span>
                          </Link>
                        );
                      })}
                    </div>

                    <div className="mt-2">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Learn & Earn
                      </div>
                      {learnEarnLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#8b63d3] ${
                              isActive
                                ? "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white"
                                : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
                            }`}
                            role="menuitem"
                          >
                            <Icon className="w-5 h-5" aria-hidden="true" />
                            <span>{link.label}</span>
                          </Link>
                        );
                      })}
                    </div>

                    <div className="mt-2">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Shop
                      </div>
                      {shopLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#8b63d3] ${
                              isActive
                                ? "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white"
                                : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
                            }`}
                            role="menuitem"
                          >
                            <Icon className="w-5 h-5" aria-hidden="true" />
                            <span>{link.label}</span>
                          </Link>
                        );
                      })}
                    </div>

                    <Link
                      to="/chatbot"
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#8b63d3] mt-2 ${
                        location.pathname === "/chatbot"
                          ? "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
                      }`}
                      role="menuitem"
                    >
                      <MessageCircle className="w-5 h-5" aria-hidden="true" />
                      <span>AI Assistant</span>
                    </Link>

                    <div className="border-t border-purple-100 dark:border-gray-700 my-3" />

                    <Link
                      to="/premium"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#8b63d3]"
                      role="menuitem"
                    >
                      <Crown className="w-5 h-5" aria-hidden="true" />
                      <span className="font-semibold">Upgrade to Premium</span>
                    </Link>

                    <Link
                      to="/cart"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-[#8b63d3]"
                      role="menuitem"
                    >
                      <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                      <span>Cart</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-[#8b63d3]"
                      role="menuitem"
                    >
                      <User className="w-5 h-5" aria-hidden="true" />
                      <span>Profile</span>
                    </Link>
                    
                  </>
                )}

                <div className="border-t border-purple-100 dark:border-gray-700 my-3" />

                {/* Sign In / Logout mobile */}
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-red-400 text-left w-full"
                    aria-label="Logout"
                  >
                    <LogOut className="w-5 h-5" aria-hidden="true" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/signin");
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-left w-full"
                    aria-label="Sign in to your account"
                  >
                    <LogIn className="w-5 h-5" aria-hidden="true" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#8b63d3] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b63d3] z-50"
      >
        Skip to main content
      </a>
    </motion.nav>
  );
}
