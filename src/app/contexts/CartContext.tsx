import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: string;
  image: string;
  url: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: Omit<CartItem, "id" | "quantity">) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => void;
  loading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, token } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated || !token) return;

    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/cart", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const cart = await response.json();
        setCartItems(cart.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: Omit<CartItem, "id" | "quantity">) => {
    if (!isAuthenticated || !token) return;

    // Validate required fields
    if (!item.name || !item.brand || !item.price || typeof item.price !== 'string') {
      console.error("Invalid item data:", item);
      return;
    }

    const requestData = {
      ...item,
      quantity: 1,
    };

    console.log("Adding item to cart:", requestData);

    try {
      const response = await fetch("http://localhost:3000/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      console.log("Cart add response:", response.status, response.statusText);

      if (response.ok) {
        await fetchCart(); // Refresh cart after adding
      } else {
        const errorText = await response.text();
        console.error("Cart add failed:", errorText);
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await fetch(`http://localhost:3000/cart/item/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart after updating
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const removeItem = async (id: string) => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await fetch(`http://localhost:3000/cart/item/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart after removing
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  return (
    <CartContext.Provider value={{
      cartItems,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      loading,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
