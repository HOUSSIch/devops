import { useNavigate, useSearchParams } from "react-router-dom";
import { GlassCard } from "../components/GlassCard";
import { PageTransition } from "../components/PageTransition";
import { BackButton } from "../components/BackButton";
import { Button } from "../components/Button";
import { motion } from "motion/react";
import {
  Truck,
  Package,
  CheckCircle,
  MapPin,
  Clock,
  Home,
} from "lucide-react";

interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  completed: boolean;
}

export function TrackPackagePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trackingNumber = searchParams.get("tracking") || "1Z999AA10123456784";
  const orderId = searchParams.get("orderId") || "#12345";

  const trackingEvents: TrackingEvent[] = [
    {
      status: "Delivered",
      location: "New York, NY 10001",
      timestamp: "January 28, 2026 at 2:45 PM",
      completed: true,
    },
    {
      status: "Out for Delivery",
      location: "New York, NY",
      timestamp: "January 28, 2026 at 8:30 AM",
      completed: true,
    },
    {
      status: "Arrived at Local Facility",
      location: "New York Distribution Center",
      timestamp: "January 27, 2026 at 11:20 PM",
      completed: true,
    },
    {
      status: "In Transit",
      location: "Philadelphia, PA",
      timestamp: "January 27, 2026 at 3:15 PM",
      completed: true,
    },
    {
      status: "In Transit",
      location: "Baltimore, MD",
      timestamp: "January 26, 2026 at 9:45 AM",
      completed: true,
    },
    {
      status: "Package Received",
      location: "DeepSkyn Warehouse",
      timestamp: "January 25, 2026 at 4:30 PM",
      completed: true,
    },
    {
      status: "Order Processed",
      location: "DeepSkyn Fulfillment Center",
      timestamp: "January 25, 2026 at 10:00 AM",
      completed: true,
    },
  ];

  const currentStatus = trackingEvents[0];
  const estimatedDelivery = "Delivered on January 28, 2026";

  return (
    <PageTransition direction="fade">
      <div className="min-h-screen bg-[#fbf3fe] p-6 py-12">
        <div className="max-w-4xl mx-auto">
          <BackButton />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Truck className="w-12 h-12 text-[#8b63d3]" />
              <h1 className="text-4xl text-gray-800">Track Package</h1>
            </div>
            <p className="text-gray-600 text-lg">Order {orderId}</p>
          </motion.div>

          {/* Tracking Number */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <GlassCard className="text-center p-6">
              <p className="text-sm text-gray-600 mb-2">Tracking Number</p>
              <p className="text-xl font-mono font-semibold text-gray-800">
                {trackingNumber}
              </p>
            </GlassCard>
          </motion.div>

          {/* Current Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <GlassCard className="bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-1">
                    {currentStatus.status}
                  </h2>
                  <p className="text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {currentStatus.location}
                  </p>
                </div>
              </div>
              <div className="bg-white/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5" />
                  <span>{estimatedDelivery}</span>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </GlassCard>
          </motion.div>

          {/* Progress Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <GlassCard>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                Tracking History
              </h3>

              <div className="space-y-4">
                {trackingEvents.map((event, index) => (
                  <div key={index} className="relative">
                    {/* Timeline Line */}
                    {index !== trackingEvents.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-purple-200" />
                    )}

                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          event.completed
                            ? "bg-[#8b63d3]"
                            : "bg-gray-300"
                        }`}
                      >
                        {index === 0 && event.completed ? (
                          <Home className="w-4 h-4 text-white" />
                        ) : event.completed ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <Package className="w-4 h-4 text-gray-600" />
                        )}
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 pb-6">
                        <div className="bg-white/30 rounded-xl p-4">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {event.status}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {event.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex gap-4"
          >
            <Button
              variant="outline"
              onClick={() => navigate(`/order-details/${orderId}`)}
              className="flex-1"
            >
              View Order Details
            </Button>
            <Button glow onClick={() => navigate("/orders")} className="flex-1">
              Back to Orders
            </Button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
