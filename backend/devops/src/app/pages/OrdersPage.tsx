import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { GlassCard } from "../components/GlassCard";
import { PageTransition } from "../components/PageTransition";
import { BackButton } from "../components/BackButton";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { Package, Truck, CheckCircle, Clock, Eye } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  brand: string;
  price: string;
  image: string;
  url?: string;
  quantity: number;
}

interface Order {
  id: string;
  total: number | null;
  status: string;
  createdAt: string;
  items: OrderItem[];
  shipping?: number;
  tax?: number;
  trackingNumber?: string;
}

export function OrdersPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(Array.isArray(data) ? data : []);
        } else {
          setError("Failed to load orders");
        }
      } catch (err) {
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return {
          text: "Delivered",
          color: "text-green-600",
          bg: "bg-green-100",
          icon: CheckCircle,
        };
      case "pending":
        return {
          text: "Processing",
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          icon: Clock,
        };
      case "cancelled":
        return {
          text: "Cancelled",
          color: "text-red-600",
          bg: "bg-red-100",
          icon: Package,
        };
      default:
        return {
          text: "In Transit",
          color: "text-blue-600",
          bg: "bg-blue-100",
          icon: Truck,
        };
    }
  };

  if (loading) {
    return (
      <PageTransition direction="fade">
        <div className="min-h-screen bg-[#fbf3fe] p-6 py-12">
          <div className="max-w-6xl mx-auto">
            <BackButton />
            <GlassCard className="text-center py-16">
              <div className="w-14 h-14 rounded-full border-4 border-[#8b63d3] border-t-transparent animate-spin mx-auto mb-4" />
              <h3 className="text-2xl text-gray-800">Loading your orders...</h3>
              <p className="text-gray-600 mt-2">
                Please wait while we fetch your order history
              </p>
            </GlassCard>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition direction="fade">
        <div className="min-h-screen bg-[#fbf3fe] p-6 py-12">
          <div className="max-w-6xl mx-auto">
            <BackButton />
            <GlassCard className="text-center py-12">
              <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-2xl text-gray-800 mb-2">Error loading orders</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button glow onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </GlassCard>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition direction="fade">
      <div className="min-h-screen bg-[#fbf3fe] p-6 py-12">
        <div className="max-w-5xl mx-auto">
          <BackButton />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Package className="w-12 h-12 text-[#8b63d3]" />
              <h1 className="text-5xl text-gray-800">My Orders</h1>
            </div>
            <p className="text-gray-600 text-xl">Track and manage your orders</p>
          </motion.div>

          <div className="space-y-6">
            {orders.length === 0 ? (
              <GlassCard className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl text-gray-800 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-6">
                  Start shopping to see your orders here
                </p>
                <Button glow onClick={() => navigate("/products")}>
                  Browse Products
                </Button>
              </GlassCard>
            ) : (
              orders.map((order, index) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <GlassCard hover>
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl text-gray-800">
                              Order #{order.id.slice(-8)}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm ${statusInfo.bg} ${statusInfo.color} flex items-center gap-1`}
                            >
                              <StatusIcon className="w-4 h-4" />
                              {statusInfo.text}
                            </span>
                          </div>
                          <p className="text-gray-600 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl text-gray-800">
                            ${(order.total ?? 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.items?.length ?? 0} items
                          </p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-sm text-gray-700 mb-3">
                          Items in this order:
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-gray-700 bg-white/30 px-4 py-2 rounded-xl"
                            >
                              <Package className="w-4 h-4 text-[#8b63d3]" />
                              <span>
                                {item.name} x{item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => navigate(`/order-details/${order.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>

                        {order.status.toLowerCase() === "completed" && (
                          <Button
                            glow
                            className="flex-1"
                            onClick={() => navigate("/products")}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Reorder
                          </Button>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-center"
          >
            <Button
              variant="outline"
              onClick={() => navigate("/products")}
              className="px-12"
            >
              Browse More Products
            </Button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}