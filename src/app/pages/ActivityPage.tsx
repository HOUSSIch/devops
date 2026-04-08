import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/app/components/GlassCard";
import { PageTransition } from "@/app/components/PageTransition";
import { BackButton } from "@/app/components/BackButton";
import { motion } from "motion/react";
import {
  Activity,
  Upload,
  ShoppingBag,
  Package,
  Heart,
  Star,
  User,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "upload" | "purchase" | "routine" | "review" | "profile" | "analysis";
  title: string;
  description: string;
  timestamp: string;
  icon: typeof Upload;
  color: string;
  bgColor: string;
}

export function ActivityPage() {
  const navigate = useNavigate();

  const activities: ActivityItem[] = [
    {
      id: "1",
      type: "upload",
      title: "Facial Analysis Completed",
      description: "Your AI skin analysis has been processed with 99.8% accuracy",
      timestamp: "2 hours ago",
      icon: Upload,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: "2",
      type: "purchase",
      title: "Order Placed - #12345",
      description: "Your order for 3 products has been confirmed",
      timestamp: "5 hours ago",
      icon: ShoppingBag,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      id: "3",
      type: "routine",
      title: "Morning Routine Completed",
      description: "Great job! You've completed your morning skincare routine",
      timestamp: "8 hours ago",
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      id: "4",
      type: "analysis",
      title: "Progress Report Generated",
      description: "Your 30-day skin improvement report is ready",
      timestamp: "1 day ago",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      id: "5",
      type: "review",
      title: "Product Review",
      description: "You rated Hydrating Serum Pro 5 stars",
      timestamp: "2 days ago",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      id: "6",
      type: "purchase",
      title: "Package Delivered",
      description: "Order #12344 has been delivered successfully",
      timestamp: "3 days ago",
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      id: "7",
      type: "profile",
      title: "Profile Updated",
      description: "You updated your skin preferences and allergies",
      timestamp: "5 days ago",
      icon: User,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
    {
      id: "8",
      type: "routine",
      title: "Evening Routine Completed",
      description: "Consistency is key! Keep up the great work",
      timestamp: "5 days ago",
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      id: "9",
      type: "upload",
      title: "New Photos Uploaded",
      description: "3 new facial photos added to your profile",
      timestamp: "1 week ago",
      icon: Upload,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: "10",
      type: "purchase",
      title: "Order Placed - #12343",
      description: "Your order for 2 products has been confirmed",
      timestamp: "1 week ago",
      icon: ShoppingBag,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  const getActivityIcon = (activity: ActivityItem) => {
    const IconComponent = activity.icon;
    return (
      <div className={`w-12 h-12 rounded-xl ${activity.bgColor} flex items-center justify-center`}>
        <IconComponent className={`w-6 h-6 ${activity.color}`} />
      </div>
    );
  };

  return (
    <PageTransition direction="fade">
      <div className="min-h-screen bg-[#fbf3fe] p-6 py-12">
        <div className="max-w-4xl mx-auto">
          <BackButton />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Activity className="w-12 h-12 text-[#8b63d3]" />
              <h1 className="text-5xl text-gray-800">Activity Feed</h1>
            </div>
            <p className="text-gray-600 text-xl">Your recent skincare journey</p>
          </motion.div>

          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <GlassCard className="text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-[#8b63d3]" />
                </div>
                <p className="text-3xl font-semibold text-gray-800 mb-1">
                  {activities.length}
                </p>
                <p className="text-sm text-gray-600">Total Activities</p>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GlassCard className="text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-3xl font-semibold text-gray-800 mb-1">
                  {activities.filter((a) => a.type === "routine").length}
                </p>
                <p className="text-sm text-gray-600">Routines Completed</p>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <GlassCard className="text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-3xl font-semibold text-gray-800 mb-1">
                  {activities.filter((a) => a.type === "purchase").length}
                </p>
                <p className="text-sm text-gray-600">Orders Placed</p>
              </GlassCard>
            </motion.div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <GlassCard hover className="p-6">
                  <div className="flex items-start gap-4">
                    {getActivityIcon(activity)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {activity.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 flex-shrink-0">
                          <Clock className="w-4 h-4" />
                          <span>{activity.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-gray-600">{activity.description}</p>

                      {/* Action buttons based on activity type */}
                      {activity.type === "purchase" && (
                        <button
                          onClick={() => navigate("/orders")}
                          className="mt-3 text-sm text-[#8b63d3] hover:underline font-medium"
                        >
                          View Order Details →
                        </button>
                      )}
                      {activity.type === "upload" && (
                        <button
                          onClick={() => navigate("/results")}
                          className="mt-3 text-sm text-[#8b63d3] hover:underline font-medium"
                        >
                          View Analysis →
                        </button>
                      )}
                      {activity.type === "routine" && (
                        <button
                          onClick={() => navigate("/routine")}
                          className="mt-3 text-sm text-[#8b63d3] hover:underline font-medium"
                        >
                          View Routine →
                        </button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-center"
          >
            <button className="px-6 py-3 rounded-xl bg-white/50 hover:bg-white/80 text-gray-700 font-medium transition-all">
              Load More Activities
            </button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
