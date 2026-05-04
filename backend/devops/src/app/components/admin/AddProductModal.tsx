import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: any) => void;
}

export function AddProductModal({ isOpen, onClose, onAdd }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "Serums",
    price: "",
    stock: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      sales: 0,
      status: parseInt(formData.stock) > 50 ? "in-stock" : parseInt(formData.stock) > 0 ? "low-stock" : "out-of-stock",
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop",
    });
    setFormData({ name: "", category: "Serums", price: "", stock: "" });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
          >
            <div className="bg-white dark:bg-[#2d1b4e] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-purple-100 dark:border-purple-800/30">
              <div className="flex items-center justify-between mb-6">
                <h2 id="product-modal-title" className="text-2xl font-bold text-gray-800 dark:text-white">
                  Add New Product
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="product-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Product Name
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
                  >
                    <option>Serums</option>
                    <option>Moisturizers</option>
                    <option>Cleansers</option>
                    <option>Treatments</option>
                    <option>Sunscreen</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Price ($)
                  </label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-purple-200 dark:border-purple-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
