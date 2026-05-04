import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BookOpen,
  Play,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Save,
  Video,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: number;
  rating: number;
  image: string;
  summary: string;
  content: string[];
}

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  category: string;
  url: string;
}

const API_BASE_URL = "http://localhost:3000";

const emptyArticleForm = {
  title: "",
  category: "",
  readTime: 5,
  rating: 5,
  image: "",
  summary: "",
  contentText: "",
};

const emptyVideoForm = {
  title: "",
  duration: "",
  thumbnail: "",
  category: "",
  url: "",
};

export default function AdminEducationPage() {
  const { token, isInitialized, isAuthenticated, isAdmin } = useAuth();

  const [tab, setTab] = useState<"articles" | "videos">("articles");
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  const [articleForm, setArticleForm] = useState(emptyArticleForm);
  const [videoForm, setVideoForm] = useState(emptyVideoForm);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    [token],
  );

  const fetchAll = async () => {
    if (!token || !isAdmin) return;

    try {
      setLoading(true);

      const [articlesRes, videosRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/education/articles`, {
          headers: authHeaders,
        }),
        axios.get(`${API_BASE_URL}/admin/education/videos`, {
          headers: authHeaders,
        }),
      ]);

      setArticles(Array.isArray(articlesRes.data) ? articlesRes.data : []);
      setVideos(Array.isArray(videosRes.data) ? videosRes.data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load education admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated || !token || !isAdmin) {
      setLoading(false);
      return;
    }

    fetchAll();
  }, [isInitialized, isAuthenticated, token, isAdmin]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) =>
      [article.title, article.category, article.summary]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  }, [articles, searchQuery]);

  const filteredVideos = useMemo(() => {
    return videos.filter((video) =>
      [video.title, video.category, video.duration]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  }, [videos, searchQuery]);

  const resetArticleModal = () => {
    setEditingArticleId(null);
    setArticleForm(emptyArticleForm);
    setShowArticleModal(false);
  };

  const resetVideoModal = () => {
    setEditingVideoId(null);
    setVideoForm(emptyVideoForm);
    setShowVideoModal(false);
  };

  const openCreateArticle = () => {
    setEditingArticleId(null);
    setArticleForm(emptyArticleForm);
    setShowArticleModal(true);
  };

  const openEditArticle = (article: Article) => {
    setEditingArticleId(article.id);
    setArticleForm({
      title: article.title,
      category: article.category,
      readTime: article.readTime,
      rating: article.rating,
      image: article.image,
      summary: article.summary,
      contentText: article.content.join("\n\n"),
    });
    setShowArticleModal(true);
  };

  const openCreateVideo = () => {
    setEditingVideoId(null);
    setVideoForm(emptyVideoForm);
    setShowVideoModal(true);
  };

  const openEditVideo = (video: VideoItem) => {
    setEditingVideoId(video.id);
    setVideoForm({
      title: video.title,
      duration: video.duration,
      thumbnail: video.thumbnail,
      category: video.category,
      url: video.url,
    });
    setShowVideoModal(true);
  };

  const handleSaveArticle = async () => {
    try {
      const payload = {
        title: articleForm.title,
        category: articleForm.category,
        readTime: Number(articleForm.readTime),
        rating: Number(articleForm.rating),
        image: articleForm.image,
        summary: articleForm.summary,
        content: articleForm.contentText
          .split("\n")
          .map((p) => p.trim())
          .filter(Boolean),
      };

      if (editingArticleId) {
        await axios.patch(
          `${API_BASE_URL}/admin/education/articles/${editingArticleId}`,
          payload,
          { headers: authHeaders },
        );
        toast.success("Article updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/admin/education/articles`, payload, {
          headers: authHeaders,
        });
        toast.success("Article created successfully");
      }

      resetArticleModal();
      fetchAll();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save article");
    }
  };

  const handleSaveVideo = async () => {
    try {
      const payload = {
        title: videoForm.title,
        duration: videoForm.duration,
        thumbnail: videoForm.thumbnail,
        category: videoForm.category,
        url: videoForm.url,
      };

      if (editingVideoId) {
        await axios.patch(
          `${API_BASE_URL}/admin/education/videos/${editingVideoId}`,
          payload,
          { headers: authHeaders },
        );
        toast.success("Video updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/admin/education/videos`, payload, {
          headers: authHeaders,
        });
        toast.success("Video created successfully");
      }

      resetVideoModal();
      fetchAll();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save video");
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Delete this article?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/admin/education/articles/${id}`, {
        headers: authHeaders,
      });
      toast.success("Article deleted successfully");
      fetchAll();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete article");
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm("Delete this video?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/admin/education/videos/${id}`, {
        headers: authHeaders,
      });
      toast.success("Video deleted successfully");
      fetchAll();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete video");
    }
  };

  if (!isInitialized || loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-[#2d1b4e] rounded-3xl p-10 shadow-lg border border-purple-100 dark:border-purple-800/30 text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-[#8b63d3] to-[#b89de6] flex items-center justify-center mb-4">
            <GraduationCap className="text-white" size={28} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            Education Management
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-white dark:bg-[#2d1b4e] rounded-3xl p-10 shadow-lg border border-purple-100 dark:border-purple-800/30 text-center">
        <p className="text-gray-600 dark:text-gray-300">You are not authenticated.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-[#2d1b4e] rounded-3xl p-10 shadow-lg border border-purple-100 dark:border-purple-800/30 text-center">
        <p className="text-gray-600 dark:text-gray-300">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#2d1b4e] rounded-[2rem] p-6 shadow-lg border border-purple-100 dark:border-purple-800/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-[#8b63d3] to-[#b89de6] mb-4 shadow-xl">
              <GraduationCap className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">
              Education Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Manage articles and videos shown in the Education Hub
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={openCreateArticle}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus size={18} />
              New Article
            </button>

            <button
              onClick={openCreateVideo}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-[#24153f] border border-purple-200 dark:border-purple-700 text-[#8b63d3] font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus size={18} />
              New Video
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-4 shadow-lg border border-purple-100 dark:border-purple-800/30">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-1 w-fit">
            <button
              onClick={() => setTab("articles")}
              className={`px-5 py-2 rounded-xl font-bold transition-all ${
                tab === "articles"
                  ? "bg-[#8b63d3] text-white shadow"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <BookOpen size={16} />
                Articles
              </span>
            </button>

            <button
              onClick={() => setTab("videos")}
              className={`px-5 py-2 rounded-xl font-bold transition-all ${
                tab === "videos"
                  ? "bg-[#8b63d3] text-white shadow"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Play size={16} />
                Videos
              </span>
            </button>
          </div>

          <div className="relative w-full md:w-[360px]">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder={`Search ${tab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {tab === "articles" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white dark:bg-[#2d1b4e] rounded-[2rem] overflow-hidden shadow-xl border border-purple-100 dark:border-purple-800/30"
            >
              <div className="h-52 overflow-hidden">
                <img
                  src={article.image || "https://via.placeholder.com/800x500?text=Article"}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-[10px] font-black uppercase text-[#8b63d3] bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full tracking-widest">
                    {article.category}
                  </span>
                  <span className="text-xs font-bold text-amber-500">
                    ★ {article.rating}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  {article.title}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>

                <div className="mt-6 flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-widest">
                  <span>{article.readTime} min read</span>
                  <span>{article.content.length} paragraphs</span>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => openEditArticle(article)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-[#8b63d3] font-bold hover:opacity-90 transition-all"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteArticle(article.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 font-bold hover:opacity-90 transition-all"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredArticles.length === 0 && (
            <div className="col-span-full bg-white dark:bg-[#2d1b4e] rounded-2xl p-10 shadow-lg border border-purple-100 dark:border-purple-800/30 text-center text-gray-500 dark:text-gray-400">
              No articles found
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white dark:bg-[#2d1b4e] rounded-[2rem] overflow-hidden shadow-xl border border-purple-100 dark:border-purple-800/30"
            >
              <div className="h-52 overflow-hidden relative">
                <img
                  src={video.thumbnail || "https://via.placeholder.com/800x500?text=Video"}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-black px-3 py-1 rounded-lg">
                  {video.duration}
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-[10px] font-black uppercase text-[#8b63d3] bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full tracking-widest">
                    {video.category}
                  </span>
                  <Video size={18} className="text-[#8b63d3]" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  {video.title}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-2 break-all">
                  {video.url}
                </p>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => openEditVideo(video)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-[#8b63d3] font-bold hover:opacity-90 transition-all"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteVideo(video.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 font-bold hover:opacity-90 transition-all"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredVideos.length === 0 && (
            <div className="col-span-full bg-white dark:bg-[#2d1b4e] rounded-2xl p-10 shadow-lg border border-purple-100 dark:border-purple-800/30 text-center text-gray-500 dark:text-gray-400">
              No videos found
            </div>
          )}
        </div>
      )}

      {showArticleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-[#2d1b4e] rounded-[2rem] shadow-2xl border border-purple-100 dark:border-purple-800/30 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-purple-100 dark:border-purple-800/30">
              <h2 className="text-2xl font-black text-gray-800 dark:text-white">
                {editingArticleId ? "Edit Article" : "Create Article"}
              </h2>
              <button
                onClick={resetArticleModal}
                className="p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto">
              <input
                placeholder="Title"
                value={articleForm.title}
                onChange={(e) =>
                  setArticleForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="md:col-span-2 px-4 py-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-gray-800 dark:text-white"
              />

              <input
                placeholder="Category"
                value={articleForm.category}
                onChange={(e) =>
                  setArticleForm((prev) => ({ ...prev, category: e.target.value }))
                }
                className="px-4 py-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-gray-800 dark:text-white"
              />

              <input
                type="number"
                placeholder="Read Time"
                value={articleForm.readTime}
                onChange={(e) =>
                  setArticleForm((prev) => ({
                    ...prev,
                    readTime: Number(e.target.value),
                  }))
                }
                className="px-4 py-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-gray-800 dark:text-white"
              />

              <input
                type="number"
                step="0.1"
                placeholder="Rating"
                value={articleForm.rating}
                onChange={(e) =>
                  setArticleForm((prev) => ({
                    ...prev,
                    rating: Number(e.target.value),
                  }))
                }
                className="px-4 py-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-gray-800 dark:text-white"
              />

              <input
                placeholder="Image URL"
                value={articleForm.image}
                onChange={(e) =>
                  setArticleForm((prev) => ({ ...prev, image: e.target.value }))
                }
                className="md:col-span-2 px-4 py-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-gray-800 dark:text-white"
              />

              <textarea
                placeholder="Summary"
                value={articleForm.summary}
                onChange={(e) =>
                  setArticleForm((prev) => ({ ...prev, summary: e.target.value }))
                }
                rows={4}
                className="md:col-span-2 px-4 py-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-gray-800 dark:text-white"
              />

              <textarea
                placeholder="Content paragraphs (one paragraph per line)"
                value={articleForm.contentText}
                onChange={(e) =>
                  setArticleForm((prev) => ({
                    ...prev,
                    contentText: e.target.value,
                  }))
                }
                rows={10}
                className="md:col-span-2 px-4 py-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-gray-800 dark:text-white"
              />
            </div>

            <div className="px-6 py-5 border-t border-purple-100 dark:border-purple-800/30 flex justify-end gap-3">
              <button
                onClick={resetArticleModal}
                className="px-5 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveArticle}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white font-bold"
              >
                <Save size={18} />
                Save Article
              </button>
            </div>
          </div>
        </div>
      )}

      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#2d1b4e] rounded-[2rem] shadow-2xl border border-purple-100 dark:border-purple-800/30 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-purple-100 dark:border-purple-800/30">
              <h2 className="text-2xl font-black text-gray-800 dark:text-white">
                {editingVideoId ? "Edit Video" : "Create Video"}
              </h2>
              <button
                onClick={resetVideoModal}
                className="p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 gap-4">
              <input
                placeholder="Title"
                value={videoForm.title}
                onChange={(e) =>
                  setVideoForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="px-4 py-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-gray-800 dark:text-white"
              />

              <input
                placeholder="Duration (e.g. 08:24)"
                value={videoForm.duration}
                onChange={(e) =>
                  setVideoForm((prev) => ({ ...prev, duration: e.target.value }))
                }
                className="px-4 py-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-gray-800 dark:text-white"
              />

              <input
                placeholder="Category"
                value={videoForm.category}
                onChange={(e) =>
                  setVideoForm((prev) => ({ ...prev, category: e.target.value }))
                }
                className="px-4 py-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-gray-800 dark:text-white"
              />

              <input
                placeholder="Thumbnail URL"
                value={videoForm.thumbnail}
                onChange={(e) =>
                  setVideoForm((prev) => ({ ...prev, thumbnail: e.target.value }))
                }
                className="px-4 py-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-gray-800 dark:text-white"
              />

              <input
                placeholder="Video URL"
                value={videoForm.url}
                onChange={(e) =>
                  setVideoForm((prev) => ({ ...prev, url: e.target.value }))
                }
                className="px-4 py-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-gray-800 dark:text-white"
              />
            </div>

            <div className="px-6 py-5 border-t border-purple-100 dark:border-purple-800/30 flex justify-end gap-3">
              <button
                onClick={resetVideoModal}
                className="px-5 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVideo}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white font-bold"
              >
                <Save size={18} />
                Save Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}