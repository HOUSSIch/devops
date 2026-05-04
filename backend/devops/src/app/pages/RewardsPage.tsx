import { useState } from 'react';
import { Trophy, Award, Flame, Star, Gift, Sparkles, TrendingUp, Lock, Check, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { PremiumFeatureLock } from '../components/PremiumFeatureLock';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  requirement: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'discount' | 'product' | 'content';
  image: string;
  claimed: boolean;
}

export default function RewardsPage() {
  const { token } = useAuth();
  const { hasAccess, tierName, requiredTierName } = useFeatureAccess("rewards");
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'rewards'>('overview');
  
  // Check if user has access to this feature
  if (token && !hasAccess) {
    return (
      <PremiumFeatureLock
        featureName="Rewards Program"
        description="Earn points and badges by completing daily routines, scanning products, and reading articles. Redeem rewards for exclusive discounts and products."
        currentPlan={tierName}
        requiredPlan={requiredTierName}
      />
    );
  }
  
  const userStats = {
    currentStreak: 7,
    longestStreak: 14,
    totalPoints: 2850,
    level: 5,
    pointsToNextLevel: 150,
    routinesCompleted: 42,
    productsScanned: 18,
    articlesRead: 12
  };

  const badges: Badge[] = [
    {
      id: '1',
      name: 'Early Bird',
      description: 'Complete 7 morning routines in a row',
      icon: '🌅',
      unlocked: true,
      unlockedAt: 'Jan 15, 2026',
      requirement: '7 day streak',
      rarity: 'common'
    },
    {
      id: '2',
      name: 'Night Owl',
      description: 'Complete 7 evening routines in a row',
      icon: '🌙',
      unlocked: true,
      unlockedAt: 'Jan 20, 2026',
      requirement: '7 day streak',
      rarity: 'common'
    },
    {
      id: '3',
      name: 'Week Warrior',
      description: 'Maintain a 7-day perfect routine streak',
      icon: '⚡',
      unlocked: true,
      unlockedAt: 'Feb 2, 2026',
      requirement: '7 consecutive days',
      rarity: 'rare'
    },
    {
      id: '4',
      name: 'Fortnight Champion',
      description: 'Maintain a 14-day perfect routine streak',
      icon: '🏆',
      unlocked: true,
      unlockedAt: 'Feb 5, 2026',
      requirement: '14 consecutive days',
      rarity: 'epic'
    },
    {
      id: '5',
      name: 'Ingredient Expert',
      description: 'Scan 20 different products',
      icon: '🔬',
      unlocked: false,
      requirement: '20 products scanned',
      rarity: 'rare'
    },
    {
      id: '6',
      name: 'Knowledge Seeker',
      description: 'Read 20 educational articles',
      icon: '📚',
      unlocked: false,
      requirement: '20 articles read',
      rarity: 'rare'
    },
    {
      id: '7',
      name: 'Monthly Master',
      description: 'Complete 30 days of perfect routines',
      icon: '👑',
      unlocked: false,
      requirement: '30 consecutive days',
      rarity: 'legendary'
    },
    {
      id: '8',
      name: 'Skin Scholar',
      description: 'Complete all education hub content',
      icon: '🎓',
      unlocked: false,
      requirement: 'All content completed',
      rarity: 'legendary'
    }
  ];

  const rewards: Reward[] = [
    {
      id: '1',
      title: '10% Off Next Order',
      description: 'Discount code for your next purchase',
      points: 500,
      type: 'discount',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=400&fit=crop',
      claimed: false
    },
    {
      id: '2',
      title: 'Free Mini Vitamin C Serum',
      description: 'Redeem a deluxe sample of our bestseller',
      points: 1000,
      type: 'product',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
      claimed: false
    },
    {
      id: '3',
      title: '15% Off Next Order',
      description: 'Enhanced discount for loyal users',
      points: 1500,
      type: 'discount',
      image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=400&fit=crop',
      claimed: false
    },
    {
      id: '4',
      title: 'Exclusive Skincare Guide',
      description: 'Premium PDF guide with advanced tips',
      points: 750,
      type: 'content',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
      claimed: false
    },
    {
      id: '5',
      title: 'Free Retinol Night Cream',
      description: 'Full-size product (30ml)',
      points: 2500,
      type: 'product',
      image: 'https://images.unsplash.com/photo-1556228841-a0c1b48d9de2?w=400&h=400&fit=crop',
      claimed: false
    },
    {
      id: '6',
      title: 'VIP Early Access',
      description: 'First access to new product launches',
      points: 2000,
      type: 'content',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
      claimed: false
    }
  ];

  const claimReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward && userStats.totalPoints >= reward.points) {
      alert(`Reward claimed! You've received: ${reward.title}`);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'legendary': return 'from-amber-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-amber-400 shadow-amber-200';
      default: return 'border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fbf3fe] to-[#ece2f9] pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#6b46b8] mb-4 shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Rewards & Achievements
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay consistent, earn rewards, and unlock exclusive benefits on your skincare journey.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#8b63d3] to-[#6b46b8] text-white shadow-lg'
                : 'bg-white/70 text-gray-700 hover:bg-white/90 border border-white/50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
              activeTab === 'badges'
                ? 'bg-gradient-to-r from-[#8b63d3] to-[#6b46b8] text-white shadow-lg'
                : 'bg-white/70 text-gray-700 hover:bg-white/90 border border-white/50'
            }`}
          >
            Badges
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
              activeTab === 'rewards'
                ? 'bg-gradient-to-r from-[#8b63d3] to-[#6b46b8] text-white shadow-lg'
                : 'bg-white/70 text-gray-700 hover:bg-white/90 border border-white/50'
            }`}
          >
            Rewards Shop
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Streak */}
              <div className="backdrop-blur-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl p-6 border border-orange-500/30 shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Current Streak</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">{userStats.currentStreak}</span>
                      <span className="text-xl font-semibold text-gray-600">days</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                    <Flame className="w-8 h-8 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">Keep it up! 7 more days for the next badge </p>
              </div>

              {/* Total Points */}
              <div className="backdrop-blur-lg bg-gradient-to-br from-[#8b63d3]/20 to-[#6b46b8]/20 rounded-3xl p-6 border border-[#8b63d3]/30 shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Total Points</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">{userStats.totalPoints.toLocaleString()}</span>
                      <span className="text-xl font-semibold text-gray-600">pts</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b63d3] to-[#6b46b8] flex items-center justify-center shadow-lg">
                    <Star className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">{userStats.pointsToNextLevel} points to Level {userStats.level + 1}</p>
              </div>

              {/* Level */}
              <div className="backdrop-blur-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-3xl p-6 border border-emerald-500/30 shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Current Level</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">{userStats.level}</span>
                      <span className="text-xl font-semibold text-gray-600">/ 10</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((3000 - userStats.pointsToNextLevel) / 3000) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-xl p-8 border border-white/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-[#8b63d3]" />
                Your Activity
              </h2>
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#8b63d3] mb-2">
                    {userStats.routinesCompleted}
                  </div>
                  <div className="text-sm text-gray-600">Routines Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#8b63d3] mb-2">
                    {userStats.productsScanned}
                  </div>
                  <div className="text-sm text-gray-600">Products Scanned</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#8b63d3] mb-2">
                    {userStats.articlesRead}
                  </div>
                  <div className="text-sm text-gray-600">Articles Read</div>
                </div>
              </div>
            </div>

            {/* Recent Badges */}
            <div className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-xl p-8 border border-white/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-[#8b63d3]" />
                Recently Unlocked
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.filter(b => b.unlocked).slice(0, 4).map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-6 rounded-2xl border-2 ${getRarityBorder(badge.rarity)} bg-white shadow-lg text-center`}
                  >
                    <div className="text-5xl mb-3">{badge.icon}</div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm">{badge.name}</h3>
                    <p className="text-xs text-gray-600">{badge.unlockedAt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            {/* Progress Summary */}
            <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-xl p-6 border border-white/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {badges.filter(b => b.unlocked).length} / {badges.length} Badges Unlocked
                  </h3>
                  <p className="text-gray-600">Keep completing activities to unlock more rewards!</p>
                </div>
                <div className="text-5xl">🏅</div>
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-[#8b63d3] to-[#6b46b8] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(badges.filter(b => b.unlocked).length / badges.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`backdrop-blur-lg rounded-2xl p-6 border-2 shadow-lg text-center transition-all ${
                    badge.unlocked
                      ? `${getRarityBorder(badge.rarity)} bg-white hover:scale-105`
                      : 'border-gray-300 bg-gray-100/50 opacity-60'
                  }`}
                >
                  <div className="relative inline-block mb-4">
                    <div className="text-6xl">{badge.icon}</div>
                    {badge.unlocked && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center border-2 border-white">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {!badge.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{badge.name}</h3>
                  <p className="text-xs text-gray-600 mb-3">{badge.description}</p>
                  {badge.unlocked ? (
                    <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                      Unlocked
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold">
                      {badge.requirement}
                    </span>
                  )}
                  {badge.rarity && (
                    <div className={`mt-2 inline-block px-2 py-1 rounded-lg bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white text-xs font-bold uppercase`}>
                      {badge.rarity}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {/* Points Balance */}
            <div className="backdrop-blur-lg bg-gradient-to-r from-[#8b63d3] to-[#6b46b8] rounded-3xl p-8 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 mb-2">Available Points</p>
                  <div className="text-5xl font-bold">{userStats.totalPoints.toLocaleString()}</div>
                </div>
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Gift className="w-10 h-10" />
                </div>
              </div>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => {
                const canAfford = userStats.totalPoints >= reward.points;
                return (
                  <div
                    key={reward.id}
                    className={`backdrop-blur-lg bg-white/80 rounded-2xl overflow-hidden shadow-lg border border-white/50 transition-all ${
                      canAfford ? 'hover:shadow-xl hover:scale-[1.02]' : 'opacity-60'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={reward.image}
                        alt={reward.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <div className="px-4 py-2 rounded-full bg-[#8b63d3] text-white font-bold shadow-lg flex items-center gap-1">
                          <Star className="w-4 h-4 fill-white" />
                          {reward.points}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 mb-2">{reward.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                      <button
                        onClick={() => claimReward(reward.id)}
                        disabled={!canAfford || reward.claimed}
                        className={`w-full py-3 rounded-xl font-semibold transition-all ${
                          canAfford && !reward.claimed
                            ? 'bg-gradient-to-r from-[#8b63d3] to-[#6b46b8] text-white hover:shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {reward.claimed ? 'Claimed' : canAfford ? 'Claim Reward' : 'Not Enough Points'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info Card */}
            <div className="backdrop-blur-lg bg-gradient-to-br from-[#8b63d3]/10 to-[#6b46b8]/10 rounded-2xl p-6 border border-[#8b63d3]/20">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#8b63d3]/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#8b63d3]" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">How to Earn Points</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Complete your daily routine: 50 points</li>
                    <li>• Scan a product: 25 points</li>
                    <li>• Read an article: 15 points</li>
                    <li>• Maintain 7-day streak: 100 bonus points</li>
                    <li>• Unlock a badge: 200 points</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
