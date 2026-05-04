import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { PremiumFeatureLock } from '../components/PremiumFeatureLock';
import axios from 'axios';
import { 
  BookOpen, Play, Search, GraduationCap, Lightbulb, 
  TrendingUp, Star, Clock, ChevronRight 
} from 'lucide-react';

// ✅ FIX: Added the missing interfaces
interface Article {
  id: string;
  title: string;
  category: string;
  readTime: number;
  rating: number;
  image: string;
  summary: string;
  content: string[]; // This is an array of strings (paragraphs)
}

interface Video {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  category: string;
}

export default function EducationPage() {
  const { token } = useAuth();
  const { hasAccess, tierName, requiredTierName } = useFeatureAccess("education");
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Check if user has access to this feature
  if (token && !hasAccess) {
    return (
      <PremiumFeatureLock
        featureName="Education Hub"
        description="Access comprehensive articles and videos about skincare, ingredients, and beauty routines designed for your skin type."
        currentPlan={tierName}
        requiredPlan={requiredTierName}
      />
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [artRes, vidRes] = await Promise.all([
          axios.get(`http://localhost:3000/education/articles`, {
            params: { category: selectedCategory, search: searchQuery }
          }),
          axios.get(`http://localhost:3000/education/videos`)
        ]);
        setArticles(artRes.data);
        setVideos(vidRes.data);
      } catch (error) {
        console.error("Error fetching education content", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchQuery]);

  // --- DETAIL VIEW LOGIC ---
  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fbf3fe] to-[#ece2f9] pt-24 pb-16 px-4 font-sans">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setSelectedArticle(null)} 
            className="flex items-center gap-2 text-[#8b63d3] font-bold mb-6 hover:gap-3 transition-all uppercase text-xs tracking-widest"
          >
            <ChevronRight className="w-5 h-5 rotate-180" /> Back to Hub
          </button>
          
          <article className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/50">
            <img src={selectedArticle.image} className="w-full h-[400px] object-cover" alt={selectedArticle.title} />
            <div className="p-12">
                <div className="flex items-center gap-4 mb-6">
                    <span className="bg-purple-100 text-[#8b63d3] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {selectedArticle.category}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400 text-xs font-bold">
                        <Clock size={14} /> {selectedArticle.readTime} MIN READ
                    </span>
                </div>
                
                <h1 className="text-4xl font-black text-gray-900 mb-8 leading-tight">
                    {selectedArticle.title}
                </h1>

                <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                    {/* ✅ FIX: Added explicit types (string and number) to satisfy TypeScript */}
                    {selectedArticle.content.map((p: string, i: number) => (
                        <p key={i}>{p}</p>
                    ))}
                </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  // --- MAIN HUB VIEW ---
  return (
    <div className="min-h-screen bg-[#fbf3fe] pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[2rem] bg-[#8b63d3] mb-6 shadow-xl shadow-purple-200">
            <GraduationCap className="text-white" size={32} />
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">Education Hub</h1>
          <p className="text-gray-500 mt-4 text-lg">Master your skincare science with expert guidance.</p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-16">
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8b63d3] transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search ingredients, routines, or concerns..." 
                    className="w-full pl-14 pr-8 py-5 rounded-[2rem] border-none shadow-2xl bg-white/70 backdrop-blur-md focus:ring-4 focus:ring-purple-100 transition-all text-gray-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        {/* Tutorials Section */}
        <div className="mb-20">
            <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3 tracking-tight">
                <Play className="text-[#8b63d3] fill-[#8b63d3]" size={24} /> VIDEO TUTORIALS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {videos.map((video: Video) => (
                    <div key={video.id} className="bg-white/80 backdrop-blur-sm rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group">
                        <div className="relative aspect-video overflow-hidden">
                            <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white p-3 rounded-full shadow-xl"><Play className="text-[#8b63d3]" size={20} /></div>
                            </div>
                            <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[9px] font-black px-2 py-1 rounded-md">{video.duration}</span>
                        </div>
                        <div className="p-5">
                            <p className="text-[#8b63d3] text-[9px] font-black uppercase mb-1">{video.category}</p>
                            <h3 className="font-bold text-gray-800 text-sm line-clamp-2 leading-snug">{video.title}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Articles Section */}
        <div>
            <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3 tracking-tight">
                <BookOpen className="text-[#8b63d3]" size={24} /> EXPERT GUIDES
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article: Article) => (
                    <div 
                        key={article.id} 
                        onClick={() => setSelectedArticle(article)}
                        className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl hover:scale-[1.03] transition-all cursor-pointer group border-2 border-transparent hover:border-purple-100"
                    >
                        <div className="h-56 overflow-hidden">
                            <img src={article.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase text-[#8b63d3] bg-purple-50 px-3 py-1 rounded-full tracking-widest">
                                    {article.category}
                                </span>
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star size={12} fill="currentColor" />
                                    <span className="text-xs font-black">{article.rating}</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#8b63d3] transition-colors leading-tight">{article.title}</h3>
                            <p className="text-sm text-gray-500 mt-4 line-clamp-2 leading-relaxed">{article.summary}</p>
                            
                            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{article.readTime} MIN READ</span>
                                <ChevronRight className="text-[#8b63d3] group-hover:translate-x-1 transition-transform" size={18} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}