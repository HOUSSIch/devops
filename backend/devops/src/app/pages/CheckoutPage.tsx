import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { GlassCard } from "../components/GlassCard";
import { PageTransition } from "../components/PageTransition";
import { motion } from "motion/react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { CreditCard, Lock, MapPin } from "lucide-react";

interface CartItem {
  name: string;
  price: string;
  quantity: number;
}

interface FormData {
  fullName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems } = useCart() as { cartItems: CartItem[] };
  const { token } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    setProcessing(true);
    try {
      const response = await fetch("http://localhost:3000/cart/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const order = await response.json();
        navigate("/confirmation", { state: { order } });
      } else {
        console.error("Checkout failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const orderItems = cartItems.map((item: CartItem) => ({
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  const subtotal = cartItems.reduce((sum: number, item: CartItem) => {
    const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
    return sum + numericPrice * item.quantity;
  }, 0);

  const shipping = 8;
  const total = subtotal + shipping;

  return (
    <PageTransition direction="left">
      <div className="min-h-screen bg-[#fbf3fe] p-6 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl text-gray-800 mb-4">Secure Checkout</h1>
            <p className="text-gray-600 text-xl">Complete your order securely</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <GlassCard>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-2xl text-gray-800 mb-4 flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-[#8b63d3]" />
                      Shipping Information
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="Email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    <Input
                      label="Address"
                      type="text"
                      placeholder="123 Main Street"
                      value={formData.address}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="mt-4"
                      required
                    />

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <Input
                        label="City"
                        type="text"
                        placeholder="New York"
                        value={formData.city}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="ZIP Code"
                        type="text"
                        placeholder="10001"
                        value={formData.zipCode}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, zipCode: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-purple-200">
                    <h3 className="text-2xl text-gray-800 mb-4 flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-[#8b63d3]" />
                      Payment Information
                    </h3>

                    <Input
                      label="Card Number"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, cardNumber: e.target.value })
                      }
                      required
                    />

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <Input
                        label="Expiry Date"
                        type="text"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, expiryDate: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="CVV"
                        type="text"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, cvv: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-xl">
                    <Lock className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700">
                      Your payment information is secure and encrypted
                    </span>
                  </div>

                  <Button
                    type="submit"
                    glow
                    className="w-full"
                    disabled={processing}
                  >
                    {processing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      `Complete Purchase - $${total.toFixed(2)}`
                    )}
                  </Button>
                </form>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <GlassCard className="sticky top-6">
                <h3 className="text-2xl text-gray-800 mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  {orderItems.map((item: CartItem, index: number) => (
                    <div key={index} className="flex justify-between text-gray-700">
                      <span className="text-sm">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="text-sm">
                        $
                        {(
                          (parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0) *
                          item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-purple-200 pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-purple-200 pt-4 mb-6">
                  <div className="flex justify-between text-gray-800 text-xl">
                    <span>Total</span>
                    <span className="text-[#8b63d3]">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-purple-50/50 rounded-xl p-4">
                  <p className="text-sm text-gray-700">
                    🎁 <strong>Free gift included!</strong>
                    <br />
                    Deluxe sample of our new Glow Serum
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}