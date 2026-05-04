import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  Activity,
  UserCheck,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down";
}

function StatCard({ title, value, change, icon, trend }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{value}</p>
          <div className="flex items-center gap-1">
            <TrendingUp
              className={`w-4 h-4 ${
                trend === "up" ? "text-green-500" : "text-red-500 rotate-180"
              }`}
            />
            <span
              className={`text-sm ${
                trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {change}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              vs last month
            </span>
          </div>
        </div>

        <div className="w-12 h-12 bg-gradient-to-br from-[#8b63d3] to-[#b89de6] rounded-xl flex items-center justify-center">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

interface RecentActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
  status: "completed" | "pending" | "failed";
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  analysesToday: number;
  revenue: number;
  totalUsersChange: string;
  activeUsersChange: string;
  analysesTodayChange: string;
  revenueChange: string;
}

interface DashboardResponse {
  stats: DashboardStats;
  recentActivity: RecentActivityItem[];
}

const API_BASE_URL = "http://localhost:3000";

export function DashboardOverview() {
  const { token, isInitialized, isAuthenticated, isAdmin } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getTrend = (change: string): "up" | "down" => {
    return change.trim().startsWith("-") ? "down" : "up";
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  const handleViewDetails = (type: string) => {
    toast.info(`Opening ${type} details...`);
  };

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated || !token) {
      setLoading(false);
      toast.error("You must be logged in");
      return;
    }

    if (!isAdmin) {
      setLoading(false);
      toast.error("Admin access required");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/admin/dashboard/overview`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error("API did not return JSON.");
        }

        const data: DashboardResponse = await response.json();

        setStats(data.stats);
        setRecentActivity(data.recentActivity);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard overview");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isInitialized, isAuthenticated, isAdmin, token]);

  const inactiveUsers = useMemo(() => {
    if (!stats) return 0;
    return Math.max(stats.totalUsers - stats.activeUsers, 0);
  }, [stats]);

  const activePercent = useMemo(() => {
    if (!stats || stats.totalUsers === 0) return 0;
    return Math.round((stats.activeUsers / stats.totalUsers) * 100);
  }, [stats]);

  const donutBackground = useMemo(() => {
    const percent = activePercent;
    return `conic-gradient(#8b63d3 0% ${percent}%, rgba(139, 99, 211, 0.15) ${percent}% 100%)`;
  }, [activePercent]);

  const barChartData = useMemo(() => {
    if (!stats) return [];

    return [
      {
        label: "Total Users",
        value: stats.totalUsers,
      },
      {
        label: "Active Users",
        value: stats.activeUsers,
      },
      {
        label: "Today",
        value: stats.analysesToday,
      },
    ];
  }, [stats]);

  const maxBarValue = useMemo(() => {
    if (barChartData.length === 0) return 1;
    return Math.max(...barChartData.map((item) => item.value), 1);
  }, [barChartData]);

  if (!isInitialized || loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-10 shadow-lg border border-purple-100 dark:border-purple-800/30 text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-10 shadow-lg border border-purple-100 dark:border-purple-800/30 text-center">
          <p className="text-gray-600 dark:text-gray-400">You are not authenticated.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-10 shadow-lg border border-purple-100 dark:border-purple-800/30 text-center">
          <p className="text-gray-600 dark:text-gray-400">Admin access required.</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-10 shadow-lg border border-purple-100 dark:border-purple-800/30 text-center">
          <p className="text-gray-600 dark:text-gray-400">Unable to load dashboard data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={stats.totalUsersChange}
          icon={<Users className="w-6 h-6 text-white" />}
          trend={getTrend(stats.totalUsersChange)}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          change={stats.activeUsersChange}
          icon={<UserCheck className="w-6 h-6 text-white" />}
          trend={getTrend(stats.activeUsersChange)}
        />
        <StatCard
          title="Analyses Today"
          value={stats.analysesToday.toLocaleString()}
          change={stats.analysesTodayChange}
          icon={<Activity className="w-6 h-6 text-white" />}
          trend={getTrend(stats.analysesTodayChange)}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              User Growth
            </h3>
            <button
              className="text-sm text-[#8b63d3] hover:text-[#7a52c2] font-medium flex items-center gap-1"
              onClick={() => handleViewDetails("User Growth")}
            >
              View Details
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 min-h-[260px] flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="relative">
              <div
                className="w-44 h-44 rounded-full flex items-center justify-center"
                style={{ background: donutBackground }}
              >
                <div className="w-28 h-28 rounded-full bg-white dark:bg-[#2d1b4e] flex flex-col items-center justify-center shadow-inner">
                  <span className="text-3xl font-bold text-gray-800 dark:text-white">
                    {activePercent}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 w-full max-w-xs">
              <div className="flex items-center justify-between rounded-xl bg-white/70 dark:bg-black/20 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#8b63d3]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active Users
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-white">
                  {stats.activeUsers}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white/70 dark:bg-black/20 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#cbb7ef]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Inactive Users
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-white">
                  {inactiveUsers}
                </span>
              </div>

              <div className="pt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total registered users
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Analysis Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              Analysis Trends
            </h3>
            <button
              className="text-sm text-[#8b63d3] hover:text-[#7a52c2] font-medium flex items-center gap-1"
              onClick={() => handleViewDetails("Analysis Trends")}
            >
              View Details
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 min-h-[260px] flex items-end justify-between gap-6">
            {barChartData.map((item, index) => {
              const height = `${Math.max((item.value / maxBarValue) * 100, 12)}%`;
              const barColors = [
                "from-[#8b63d3] to-[#b89de6]",
                "from-[#6d48b8] to-[#9d7be0]",
                "from-[#b089f7] to-[#d1b3ff]",
              ];

              return (
                <div
                  key={item.label}
                  className="flex-1 h-[200px] flex flex-col justify-end items-center gap-3"
                >
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">
                    {item.value}
                  </span>

                  <div className="w-full h-[150px] flex items-end justify-center">
                    <div
                      className={`w-16 rounded-t-2xl bg-gradient-to-t ${barColors[index]} shadow-lg transition-all duration-500`}
                      style={{ height }}
                    />
                  </div>

                  <span className="text-xs text-center text-gray-600 dark:text-gray-400 font-medium">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-[#2d1b4e] rounded-2xl shadow-lg border border-purple-100 dark:border-purple-800/30 overflow-hidden"
      >
        <div className="p-6 border-b border-purple-100 dark:border-purple-800/30">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Recent Activity
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50 dark:bg-purple-900/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-purple-100 dark:divide-purple-800/30">
              {recentActivity.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No recent activity found
                  </td>
                </tr>
              ) : (
                recentActivity.map((activity) => (
                  <tr
                    key={activity.id}
                    className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {activity.user}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.action}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-500">
                        {formatRelativeTime(activity.time)}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          activity.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : activity.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}