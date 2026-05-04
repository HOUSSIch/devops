import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { PageTransition } from "../../components/PageTransition";
import { AdminAccessibilityMenu } from "../../components/admin/AdminAccessibilityMenu";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  ScanFace,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

export function AdminDashboardLayout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: "users", label: "Users Management", icon: Users, path: "/admin/users" },
    { id: "analysis", label: "Skin Analysis Results", icon: ScanFace, path: "/admin/analysis" },
    { id: "products", label: "Products Management", icon: Package, path: "/admin/products" },
    { id: "reports", label: "Reports & Analytics", icon: BarChart3, path: "/admin/reports" },
    { id: "education", label: "Education Management", icon: GraduationCap, path: "/admin/education" },
    { id: "settings", label: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const currentPage =
    menuItems.find((item) => location.pathname.startsWith(item.path))?.label || "Dashboard";

  return (
    <PageTransition direction="fade">
      <div className="min-h-screen bg-[#fbf3fe] dark:bg-[#1a0f2e] flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#2d1b4e] border-r border-purple-100 dark:border-purple-800/30 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 transition-transform duration-300`}
        >
          <div className="h-full flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-purple-100 dark:border-purple-800/30 relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8b63d3] to-[#b89de6] rounded-xl flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-800 dark:text-white">DeepSkyn</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
                </div>
              </div>

              {/* Close button for mobile */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden absolute top-6 right-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white shadow-lg"
                        : "text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-purple-100 dark:border-purple-800/30">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-white dark:bg-[#2d1b4e] border-b border-purple-100 dark:border-purple-800/30 px-6 py-4 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 dark:text-gray-300"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {currentPage}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Welcome back, {username || "Administrator"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden md:flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-xl">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 w-48"
                  />
                </div>

                {/* Notifications */}
                <button className="relative p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors">
                  <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile */}
                <div className="flex items-center gap-3">
                  <img
                    src="https://via.placeholder.com/100x100.png?text=Admin"
                    alt={username || "Administrator"}
                    className="w-10 h-10 rounded-full border-2 border-purple-200 dark:border-purple-700 object-cover"
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {username || "Administrator"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}

        {/* Accessibility Menu */}
        <AdminAccessibilityMenu />
      </div>
    </PageTransition>
  );
}