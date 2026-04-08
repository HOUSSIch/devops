import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, Filter, Download, Eye, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type AnalysisStatus = "completed" | "processing" | "pending";

interface AnalysisConcernObject {
  name?: string;
  title?: string;
  concern?: string;
  label?: string;
}

interface AnalysisData {
  id: string;
  userName: string;
  userAvatar: string;
  date: string;
  skinType: string;
  concerns: string[];
  score: number;
  status: AnalysisStatus;
}

interface ApiAnalysis {
  id: string;
  skinType: string;
  healthScore: number;
  concerns: string[] | AnalysisConcernObject[];
  createdAt: string;
  imageUrl?: string;
  status?: AnalysisStatus;
  user?: {
    username?: string | null;
    email?: string | null;
    avatar?: string | null;
  };
}

const API_BASE_URL = "http://localhost:3000";

const SkinAnalysisResults = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 5;

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/analyses`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch analyses: ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          const text = await response.text();
          console.error("API returned non-JSON response:", text.slice(0, 300));
          throw new Error("API did not return JSON. Check /analyses route.");
        }

        const data: ApiAnalysis[] = await response.json();

        const mappedAnalyses: AnalysisData[] = data.map((item) => ({
          id: item.id,
          userName: item.user?.username || item.user?.email || "Unknown User",
          userAvatar:
            item.user?.avatar ||
            item.imageUrl ||
            "https://via.placeholder.com/100x100.png?text=User",
          date: item.createdAt,
          skinType: item.skinType,
          concerns: Array.isArray(item.concerns)
            ? item.concerns.map((c) =>
                typeof c === "string"
                  ? c
                  : c.name || c.title || c.concern || c.label || "Concern"
              )
            : [],
          score: item.healthScore,
          status: item.status || "completed",
        }));

        setAnalyses(mappedAnalyses);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load skin analyses");
        setAnalyses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  const filteredAnalyses = useMemo(() => {
    return analyses.filter((analysis) => {
      const matchesSearch = analysis.userName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || analysis.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [analyses, searchQuery, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredAnalyses.length / pageSize));

  const paginatedAnalyses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAnalyses.slice(start, start + pageSize);
  }, [filteredAnalyses, currentPage]);

  const totalAnalyses = analyses.length;

  const thisWeekAnalyses = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    return analyses.filter((analysis) => {
      const analysisDate = new Date(analysis.date);
      return analysisDate >= sevenDaysAgo && analysisDate <= now;
    }).length;
  }, [analyses]);

  const averageScore = useMemo(() => {
    if (analyses.length === 0) return 0;
    const total = analyses.reduce((sum, analysis) => sum + analysis.score, 0);
    return total / analyses.length;
  }, [analyses]);

  const processingCount = useMemo(() => {
    return analyses.filter((analysis) => analysis.status === "processing").length;
  }, [analyses]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  const handleExportReports = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analyses/export`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "skin-analyses.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      toast.success("Reports exported successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export reports");
    }
  };

  const handleViewAnalysis = (id: string) => {
    navigate(`/dashboard/analyses/${id}`);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Skin Analysis Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all skin analysis reports
          </p>
        </div>

        <button
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white rounded-xl hover:shadow-lg transition-all"
          onClick={handleExportReports}
        >
          <Download className="w-5 h-5" />
          Export Reports
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Analyses
          </div>
          <div className="text-3xl font-bold text-gray-800 dark:text-white">
            {totalAnalyses}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            This Week
          </div>
          <div className="text-3xl font-bold text-gray-800 dark:text-white">
            {thisWeekAnalyses}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Avg. Score
          </div>
          <div className="text-3xl font-bold text-gray-800 dark:text-white">
            {averageScore.toFixed(1)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Processing
          </div>
          <div className="text-3xl font-bold text-gray-800 dark:text-white">
            {processingCount}
          </div>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#2d1b4e] rounded-2xl shadow-lg border border-purple-100 dark:border-purple-800/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50 dark:bg-purple-900/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Skin Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Concerns
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-purple-100 dark:divide-purple-800/30">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-gray-600 dark:text-gray-400"
                  >
                    Loading analyses...
                  </td>
                </tr>
              ) : paginatedAnalyses.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-gray-600 dark:text-gray-400"
                  >
                    No analyses found
                  </td>
                </tr>
              ) : (
                paginatedAnalyses.map((analysis, index) => (
                  <motion.tr
                    key={analysis.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={analysis.userAvatar}
                          alt={analysis.userName}
                          className="w-10 h-10 rounded-full border-2 border-purple-200 dark:border-purple-700 object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/100x100.png?text=User";
                          }}
                        />
                        <div className="text-sm font-semibold text-gray-800 dark:text-white">
                          {analysis.userName}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(analysis.date).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {analysis.skinType}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {analysis.concerns.length > 0 ? (
                          analysis.concerns.map((concern, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                            >
                              {concern}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            No concerns
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreBgColor(
                          analysis.score,
                        )} ${getScoreColor(analysis.score)}`}
                      >
                        {analysis.score}/100
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          analysis.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : analysis.status === "processing"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                        }`}
                      >
                        {analysis.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#8b63d3] hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        onClick={() => handleViewAnalysis(analysis.id)}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-purple-100 dark:border-purple-800/30 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing{" "}
            {filteredAnalyses.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}{" "}
            to {Math.min(currentPage * pageSize, filteredAnalyses.length)} of{" "}
            {filteredAnalyses.length} analyses
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 border border-purple-200 dark:border-purple-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              disabled={currentPage >= totalPages || filteredAnalyses.length === 0}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-4 py-2 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SkinAnalysisResults };
export default SkinAnalysisResults;