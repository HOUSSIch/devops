import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { PremiumFeatureLock } from '../components/PremiumFeatureLock';
import { toast } from 'sonner';
import {
  Camera, TrendingUp, Calendar, Sun,
  Moon, Activity, Droplets, LayoutGrid, ArrowRightLeft, X,
  Zap
} from 'lucide-react';

export default function ProgressTrackerPage() {
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const token = auth?.token;
  const { hasAccess, tierName, requiredTierName } = useFeatureAccess("progress_tracker");

  // Check if user has access to this feature
  if (token && !hasAccess) {
    return (
      <PremiumFeatureLock
        featureName="Progress Tracker"
        description="Track your transformation with AI insights to see your skincare journey progress over time."
        currentPlan={tierName}
        requiredPlan={requiredTierName}
      />
    );
  }

  const [activeTab, setActiveTab] = useState<'timeline' | 'compare'>('timeline');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      console.log('auth =', auth);
      console.log('ProgressTracker token =', token);

      if (!token) {
        toast.error('You are not authenticated.');
        setIsLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          'http://localhost:3000/users/progress-history',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setPhotos(res.data || []);
      } catch (err: any) {
        console.error('Progress history error:', err?.response || err);

        if (err?.response?.status === 403) {
          toast.error('Access forbidden. Your token may be invalid or expired.');
        } else if (err?.response?.status === 401) {
          toast.error('You are not authenticated.');
        } else {
          toast.error('History could not be loaded.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [token, auth]);

  const toggleSelect = (id: string) => {
    if (selectedPhotos.includes(id)) {
      setSelectedPhotos((prev) => prev.filter((x) => x !== id));
    } else if (selectedPhotos.length < 2) {
      setSelectedPhotos((prev) => [...prev, id]);
    } else {
      toast.error('You can only compare 2 photos at a time.');
    }
  };

  const getComparisonData = () => {
    const selected = photos.filter((p) => selectedPhotos.includes(p.id));
    return selected.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbf3fe] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  const comparisonItems = getComparisonData();

  return (
    <div className="min-h-screen bg-[#fbf3fe] pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="w-14 h-14 bg-[#8b63d3] rounded-3xl flex items-center justify-center shadow-lg shadow-purple-200">
            <TrendingUp className="text-white w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Progress Tracker
          </h1>
          <p className="text-gray-500 max-w-lg text-sm">
            Track your transformation with AI insights.
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="w-full bg-[#7c4dff] hover:bg-[#6b3ee6] text-white py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 font-bold text-lg transition-all"
        >
          <Camera size={22} /> Take Progress Photo
        </button>

        <div className="flex p-1.5 bg-white/50 backdrop-blur-md rounded-2xl border border-white shadow-sm">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${activeTab === 'timeline' ? 'bg-[#8b63d3] text-white shadow-lg' : 'text-gray-500'}`}
          >
            <LayoutGrid size={18} /> Timeline View
          </button>
          <button
            onClick={() => {
              if (selectedPhotos.length < 2) {
                toast.error('Please select 2 photos from the timeline first.');
              } else {
                setActiveTab('compare');
              }
            }}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${activeTab === 'compare' ? 'bg-[#8b63d3] text-white shadow-lg' : 'text-gray-500'}`}
          >
            <ArrowRightLeft size={18} /> Compare Photos
          </button>
        </div>

        {activeTab === 'timeline' ? (
          <>
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-white">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Activity size={18} className="text-[#8b63d3]" /> Health & Lifestyle Data
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { l: 'Avg Sleep', v: '7.5h', s: 'Optimal', i: Moon, c: 'text-purple-600', bg: 'bg-purple-100' },
                  { l: 'UV Exposure', v: '3/10', s: 'Moderate', i: Sun, c: 'text-orange-500', bg: 'bg-orange-100' },
                  { l: 'Glasses/Day', v: '8', s: 'Excellent', i: Droplets, c: 'text-blue-500', bg: 'bg-blue-100' },
                  { l: 'Stress Level', v: '4/10', s: 'Manageable', i: Zap, c: 'text-pink-500', bg: 'bg-pink-100' },
                ].map((st, i) => (
                  <div key={i} className="text-center">
                    <div className={`w-14 h-14 mx-auto rounded-2xl ${st.bg} flex items-center justify-center mb-3`}>
                      <st.i className={st.c} size={28} />
                    </div>
                    <p className="text-2xl font-black text-gray-800">{st.v}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{st.l}</p>
                    <p className={`text-[10px] font-black uppercase mt-1 ${st.c}`}>{st.s} ✓</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-white">
              <h2 className="text-lg font-bold text-gray-800 mb-8 flex items-center gap-2">
                <Calendar size={18} className="text-[#8b63d3]" /> Your Journey
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => toggleSelect(photo.id)}
                    className={`relative bg-white p-3 rounded-[2rem] shadow-sm border-2 transition-all cursor-pointer ${selectedPhotos.includes(photo.id) ? 'border-[#8b63d3] scale-105 shadow-md' : 'border-transparent hover:bg-gray-50'}`}
                  >
                    <div className="relative aspect-square rounded-[1.5rem] overflow-hidden mb-3">
                      <img src={photo.imageUrl} className="w-full h-full object-cover" alt="Skin" />
                      <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-[8px] font-black uppercase text-white ${photo.time === 'morning' ? 'bg-amber-400' : 'bg-indigo-500'}`}>
                        {photo.time}
                      </div>
                      {selectedPhotos.includes(photo.id) && (
                        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-[#8b63d3] text-white flex items-center justify-center font-bold border-2 border-white">
                            {selectedPhotos.indexOf(photo.id) + 1}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-gray-800">{photo.date}</p>
                    <p className="text-[10px] text-gray-400 line-clamp-2 mt-1">{photo.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl border border-white animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold text-gray-800">Side-by-Side Analysis</h2>
              <button
                onClick={() => {
                  setActiveTab('timeline');
                  setSelectedPhotos([]);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {comparisonItems.map((item, idx) => (
                <div key={item.id} className="space-y-6">
                  <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl">
                    <img src={item.imageUrl} className="w-full h-full object-cover" alt="Comparison" />
                    <div className="absolute top-6 left-6 bg-[#8b63d3] text-white px-6 py-2 rounded-full font-black uppercase tracking-widest text-[10px]">
                      {idx === 0 ? 'Initial State' : 'Current Result'}
                    </div>
                  </div>
                  <div className="bg-white/50 p-6 rounded-[2rem] border border-white shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-lg text-gray-800">{item.date}</h4>
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${item.time === 'morning' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        {item.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed italic">"{item.notes}"</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 rounded-3xl bg-green-50 border border-green-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <TrendingUp size={24} />
              </div>
              <div>
                <h4 className="font-bold text-green-800">Progress Detected!</h4>
                <p className="text-sm text-green-700 opacity-80">
                  Visible improvement in hydration and skin texture since your first analysis.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && selectedPhotos.length > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#1e1b4b]/95 backdrop-blur-xl px-8 py-4 rounded-full shadow-2xl flex items-center gap-8 z-50 animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-white text-xs font-bold uppercase tracking-widest">
                {selectedPhotos.length} / 2 Selected
              </p>
            </div>
            {selectedPhotos.length === 2 && (
              <button
                onClick={() => setActiveTab('compare')}
                className="bg-white text-[#1e1b4b] px-6 py-2 rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Compare
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}