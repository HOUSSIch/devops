import { useState } from "react";
import { motion } from "motion/react";
import { Search, Filter, Plus, Edit, Trash2, DollarSign, Package } from "lucide-react";
import { AddProductModal } from "@/app/components/admin/AddProductModal";
import { toast } from "sonner";

interface ProductData {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sales: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  image: string;
}

export function ProductsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [products, setProducts] = useState<ProductData[]>([
    {
      id: "1",
      name: "Hydrating Facial Serum",
      category: "Serums",
      price: 49.99,
      stock: 156,
      sales: 1284,
      status: "in-stock",
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop",
    },
    {
      id: "2",
      name: "Vitamin C Brightening Cream",
      category: "Moisturizers",
      price: 39.99,
      stock: 23,
      sales: 956,
      status: "low-stock",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=100&h=100&fit=crop",
    },
    {
      id: "3",
      name: "Gentle Cleansing Foam",
      category: "Cleansers",
      price: 24.99,
      stock: 0,
      sales: 2145,
      status: "out-of-stock",
      image: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=100&h=100&fit=crop",
    },
    {
      id: "4",
      name: "Retinol Night Treatment",
      category: "Treatments",
      price: 64.99,
      stock: 89,
      sales: 678,
      status: "in-stock",
      image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=100&h=100&fit=crop",
    },
    {
      id: "5",
      name: "SPF 50 Sunscreen",
      category: "Sunscreen",
      price: 29.99,
      stock: 234,
      sales: 3421,
      status: "in-stock",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&h=100&fit=crop",
    },
  ]);

  const handleAddProduct = (newProduct: ProductData) => {
    setProducts([newProduct, ...products]);
    toast.success("Product added successfully!");
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(product => product.id !== id));
      toast.success("Product deleted successfully!");
    }
  };

  const handleEditProduct = (id: string) => {
    toast.info("Edit functionality coming soon!");
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory === "all" || 
                         product.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const totalProducts = products.length;
  const inStockCount = products.filter(p => p.status === "in-stock").length;
  const lowStockCount = products.filter(p => p.status === "low-stock").length;
  const outOfStockCount = products.filter(p => p.status === "out-of-stock").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Products Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your skincare product inventory
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white rounded-xl hover:shadow-lg transition-all"
          aria-label="Add new product"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Products</div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">{totalProducts}</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-[#8b63d3]" aria-hidden="true" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Stock</div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">{inStockCount}</div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" aria-hidden="true" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Low Stock</div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">{lowStockCount}</div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-yellow-600" aria-hidden="true" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Out of Stock</div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">{outOfStockCount}</div>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-red-600" aria-hidden="true" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-[#2d1b4e] rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800/30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
              aria-label="Search products"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b63d3] text-gray-800 dark:text-white"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="serums">Serums</option>
              <option value="moisturizers">Moisturizers</option>
              <option value="cleansers">Cleansers</option>
              <option value="treatments">Treatments</option>
              <option value="sunscreen">Sunscreen</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-[#2d1b4e] rounded-2xl shadow-lg border border-purple-100 dark:border-purple-800/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50 dark:bg-purple-900/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100 dark:divide-purple-800/30">
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-purple-100 dark:border-purple-700"
                      />
                      <div className="text-sm font-semibold text-gray-800 dark:text-white">
                        {product.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-800 dark:text-white">
                      <DollarSign className="w-4 h-4" aria-hidden="true" />
                      {product.price.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {product.sales.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        product.status === "in-stock"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : product.status === "low-stock"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {product.status.replace("-", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditProduct(product.id)}
                        className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Edit className="w-4 h-4 text-[#8b63d3]" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-purple-100 dark:border-purple-800/30 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 border border-purple-200 dark:border-purple-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              aria-label="Previous page"
            >
              Previous
            </button>
            <button
              className="px-4 py-2 bg-gradient-to-r from-[#8b63d3] to-[#b89de6] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddProduct} />
    </div>
  );
}
