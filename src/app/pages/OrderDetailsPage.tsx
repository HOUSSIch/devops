import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GlassCard } from "../components/GlassCard";
import { PageTransition } from "../components/PageTransition";
import { BackButton } from "../components/BackButton";
import { Button } from "../components/Button";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  Download,
  Phone,
  Mail,
} from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  brand: string;
  price: string;
  image: string;
  url: string;
  quantity: number;
}

interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
}

interface PaymentMethod {
  brand: string;
  last4: string;
  type: string;
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
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentMethod?: PaymentMethod;
}

export function OrderDetailsPage() {
  const navigate = useNavigate();
  const { id: orderId } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !token) {
        if (!token) {
          setError("Authentication token not available. Please log in.");
        } else if (!orderId) {
          setError("Order ID not found");
        }
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        } else {
          setError("Failed to load order details");
        }
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, token]);

  const getStatusInfo = (status: string) => {
    switch ((status || "").toLowerCase()) {
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
          <div className="max-w-4xl mx-auto">
            <BackButton />
            <GlassCard className="text-center py-16">
              <div className="w-14 h-14 rounded-full border-4 border-[#8b63d3] border-t-transparent animate-spin mx-auto mb-4" />
              <h3 className="text-2xl text-gray-800">Loading order details...</h3>
              <p className="text-gray-600 mt-2">
                Please wait while we fetch your order information
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
          <div className="max-w-4xl mx-auto">
            <BackButton />
            <GlassCard className="text-center py-12">
              <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-2xl text-gray-800 mb-2">Error loading order</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button glow onClick={() => navigate("/orders")}>
                Back to Orders
              </Button>
            </GlassCard>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!order) {
    return (
      <PageTransition direction="fade">
        <div className="min-h-screen bg-[#fbf3fe] p-6 py-12">
          <div className="max-w-4xl mx-auto">
            <BackButton />
            <GlassCard className="text-center py-12">
              <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-2xl text-gray-800 mb-2">Order not found</h3>
              <p className="text-gray-600 mb-6">
                The requested order could not be found.
              </p>
              <Button glow onClick={() => navigate("/orders")}>
                Back to Orders
              </Button>
            </GlassCard>
          </div>
        </div>
      </PageTransition>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  const subtotal = order.total ?? 0;
  const shipping = order.shipping ?? 8;
  const tax = order.tax ?? subtotal * 0.08;
  const grandTotal = subtotal + shipping + tax;

  return (
    <PageTransition direction="fade">
      <div className="min-h-screen bg-[#fbf3fe] p-6 py-12">
        <div className="max-w-5xl mx-auto">
          <BackButton />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl text-gray-800 mb-2">
                  Order #{order.id.slice(-8)}
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Invoice
              </Button>
            </div>

            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}
            >
              <StatusIcon className="w-4 h-4" />
              {statusInfo.text}
            </span>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <GlassCard>
                  <h2 className="text-2xl text-gray-800 mb-6">Order Items</h2>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div
                        key={item.id ?? index}
                        className="flex items-center gap-4 pb-4 border-b border-purple-100 last:border-0"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-gray-800 font-medium mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-600">Brand: {item.brand}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-gray-800">
                          $
                          {(
                            (parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0) *
                            item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-purple-200">
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Shipping</span>
                        <span>${shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Tax</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <div className="flex justify-between text-xl font-bold text-gray-800">
                        <span>Total</span>
                        <span>${grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <GlassCard>
                  <div className="flex items-center gap-2 mb-6">
                    <Truck className="w-6 h-6 text-[#8b63d3]" />
                    <h2 className="text-2xl text-gray-800">Tracking Information</h2>
                  </div>

                  <div className="bg-purple-50/50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-700 mb-2">Tracking Number:</p>
                    <p className="text-gray-800 font-mono font-semibold">
                      {order.trackingNumber ?? "Not available yet"}
                    </p>
                  </div>

                  <Button
                    glow
                    onClick={() =>
                      navigate(
                        `/track-package?tracking=${order.trackingNumber ?? ""}&orderId=${order.id}`
                      )
                    }
                    className="w-full flex items-center justify-center gap-2"
                    disabled={!order.trackingNumber}
                  >
                    <Truck className="w-5 h-5" />
                    Track Package
                  </Button>
                </GlassCard>
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <GlassCard>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-[#8b63d3]" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Shipping Address
                    </h3>
                  </div>
                  <div className="text-gray-700 space-y-1">
                    <p className="font-medium">
                      {order.shippingAddress?.name ?? "N/A"}
                    </p>
                    <p>{order.shippingAddress?.street ?? "N/A"}</p>
                    <p>
                      {order.shippingAddress?.city ?? ""}{" "}
                      {order.shippingAddress?.state ?? ""}{" "}
                      {order.shippingAddress?.zip ?? ""}
                    </p>
                    {order.shippingAddress?.phone && (
                      <p className="flex items-center gap-2 pt-2">
                        <Phone className="w-4 h-4" />
                        {order.shippingAddress.phone}
                      </p>
                    )}
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <GlassCard>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-[#8b63d3]" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Billing Address
                    </h3>
                  </div>
                  <div className="text-gray-700 space-y-1">
                    <p className="font-medium">{order.billingAddress?.name ?? "N/A"}</p>
                    <p>{order.billingAddress?.street ?? "N/A"}</p>
                    <p>
                      {order.billingAddress?.city ?? ""}{" "}
                      {order.billingAddress?.state ?? ""}{" "}
                      {order.billingAddress?.zip ?? ""}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <GlassCard>
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-[#8b63d3]" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Payment Method
                    </h3>
                  </div>
                  <div className="text-gray-700">
                    <p className="font-medium mb-1">
                      {order.paymentMethod?.brand ?? "Card"} ••••{" "}
                      {order.paymentMethod?.last4 ?? "****"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.paymentMethod?.type ?? "Payment method unavailable"}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <GlassCard className="bg-purple-50/30">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Need Help?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Contact our support team for assistance with your order.
                  </p>
                  <div className="space-y-2">
                    <a
                      href="mailto:support@deepskyn.com"
                      className="flex items-center gap-2 text-sm text-[#8b63d3] hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      support@deepskyn.com
                    </a>
                    <a
                      href="tel:+15551234567"
                      className="flex items-center gap-2 text-sm text-[#8b63d3] hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      +1 (555) 123-4567
                    </a>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}