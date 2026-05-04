import { motion } from "motion/react";
import { TrendingUp, Users, DollarSign, Activity, Download, Calendar } from "lucide-react";
import { toast } from "sonner";

export function ReportsAnalytics() {
  const handleExport = () => {
    toast.success("Report exported successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track performance and business metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-3 bg-white dark:bg-[#2d1b4e] border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>Last Year</option>
          </select>
          <button
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white rounded-xl hover:shadow-lg transition-all"
            onClick={handleExport}
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              +15.3%
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">$12,847</div>
          <div className="text-purple-100 text-sm">Total Revenue</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              +12.5%
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">5,234</div>
          <div className="text-blue-100 text-sm">Total Users</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg text-white"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              +23.1%
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">12,847</div>
          <div className="text-green-100 text-sm">Total Analyses</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg text-white"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              +8.7%
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">73.2%</div>
          <div className="text-orange-100 text-sm">Conversion Rate</div>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                Revenue Overview
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly revenue trends</p>
            </div>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <div className="text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Revenue Chart</p>
              <p className="text-xs text-gray-400 mt-1">Chart visualization coming soon</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                User Growth
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">New user registrations</p>
            </div>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">User Growth Chart</p>
              <p className="text-xs text-gray-400 mt-1">Chart visualization coming soon</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                Analysis Trends
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily analysis volume</p>
            </div>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <div className="text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Analysis Trends Chart</p>
              <p className="text-xs text-gray-400 mt-1">Chart visualization coming soon</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                Product Performance
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Top selling products</p>
            </div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {[
              { name: "Hydrating Facial Serum", sales: 1284, revenue: "$64,172" },
              { name: "SPF 50 Sunscreen", sales: 3421, revenue: "$102,509" },
              { name: "Gentle Cleansing Foam", sales: 2145, revenue: "$53,578" },
              { name: "Vitamin C Cream", sales: 956, revenue: "$38,224" },
            ].map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl"
              >
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
                    {product.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {product.sales} sales
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#8b63d3]">{product.revenue}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white dark:bg-[#2d1b4e] rounded-2xl shadow-lg border border-purple-100 dark:border-purple-800/30 overflow-hidden"
      >
        <div className="p-6 border-b border-purple-100 dark:border-purple-800/30">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Monthly Performance Summary
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50 dark:bg-purple-900/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  New Users
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Analyses
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100 dark:divide-purple-800/30">
              {[
                { month: "February 2024", revenue: "$12,847", users: 423, analyses: 2847, growth: "+15.3%" },
                { month: "January 2024", revenue: "$11,142", users: 389, analyses: 2456, growth: "+12.8%" },
                { month: "December 2023", revenue: "$9,876", users: 345, analyses: 2134, growth: "+9.4%" },
                { month: "November 2023", revenue: "$9,023", users: 312, analyses: 1987, growth: "+7.2%" },
              ].map((row, index) => (
                <tr key={index} className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                    {row.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-white">
                    {row.revenue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {row.users}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {row.analyses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {row.growth}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}