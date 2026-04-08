import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Scan,
  Camera,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Sparkles,
  Layers,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useFeatureAccess } from "../../hooks/useFeatureAccess";
import { PremiumFeatureLock } from "../components/PremiumFeatureLock";

interface ScannedProduct {
  barcode: string;
  name: string;
  brand: string;
  image: string;
  compatibility: "excellent" | "good" | "caution" | "avoid";
  compatibilityScore: number;
  ingredients: {
    name: string;
    status: "beneficial" | "neutral" | "problematic";
    description: string;
  }[];
  layeringOrder: number;
  conflictsWith: string[];
  recommendations: string[];
}

export default function ScannerPage() {
  const navigate = useNavigate();
  const { token, refreshNow, isAuthenticated, login } = useAuth();
  const { hasAccess, tierName, requiredTierName } = useFeatureAccess("scanner");

  // Check if user has access to this feature
  if (isAuthenticated && !hasAccess) {
    return (
      <PremiumFeatureLock
        featureName="Ingredient Scanner"
        description="Scan any skincare product to instantly check compatibility with your skin type and routine."
        currentPlan={tierName}
        requiredPlan={requiredTierName}
      />
    );
  }

  const [scanning, setScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const analyzeProduct = async (query: string) => {
    if (!query.trim()) return;

    try {
      setScanning(true);
      setErrorMessage("");

      await refreshNow();

      const response = await fetch("http://localhost:3000/scanner/analyze-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : data?.error || "Failed to analyze product",
        );
      }

      setScannedProduct(data);
    } catch (error: any) {
      console.error("Scanner text error:", error);
      setErrorMessage(error?.message || "Failed to analyze product");
    } finally {
      setScanning(false);
    }
  };

  const analyzeProductImage = async (file: File) => {
    try {
      setScanning(true);
      setErrorMessage("");

      await refreshNow();

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("http://localhost:3000/scanner/analyze-product-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : data?.error || "Failed to analyze product image",
        );
      }

      setScannedProduct(data);
    } catch (error: any) {
      console.error("Scanner image error:", error);
      setErrorMessage(error?.message || "Failed to analyze product image");
    } finally {
      setScanning(false);
    }
  };

  const handleManualSearch = () => {
    if (!searchQuery.trim()) return;
    analyzeProduct(searchQuery);
    setSearchQuery("");
  };

  const handleCameraFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await analyzeProductImage(file);
    e.target.value = "";
  };

  const handleGalleryFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await analyzeProductImage(file);
    e.target.value = "";
  };

  const getCompatibilityColor = (compatibility: string) => {
    switch (compatibility) {
      case "excellent":
        return "from-green-400 to-emerald-500";
      case "good":
        return "from-blue-400 to-cyan-500";
      case "caution":
        return "from-amber-400 to-orange-500";
      case "avoid":
        return "from-red-400 to-rose-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getCompatibilityIcon = (compatibility: string) => {
    switch (compatibility) {
      case "excellent":
      case "good":
        return <CheckCircle className="w-6 h-6" />;
      case "caution":
        return <AlertTriangle className="w-6 h-6" />;
      case "avoid":
        return <X className="w-6 h-6" />;
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  const getIngredientColor = (status: string) => {
    switch (status) {
      case "beneficial":
        return "bg-green-100 text-green-800 border-green-200";
      case "neutral":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "problematic":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fbf3fe] to-[#ece2f9] pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-xl p-8 border border-white/50 text-center max-w-lg w-full">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#6b46b8] mb-4 shadow-lg">
            <Scan className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Please log in</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in so we can analyze the product using your previous skin analysis.
          </p>
          <button
            onClick={() => login("/scanner")}
            className="bg-gradient-to-r from-[#8b63d3] to-[#6b46b8] text-white px-6 py-3 rounded-xl font-semibold"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fbf3fe] to-[#ece2f9] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCameraFileChange}
        />

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleGalleryFileChange}
        />

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#6b46b8] mb-4 shadow-lg">
            <Scan className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Ingredient Scanner
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Scan any skincare product to instantly check compatibility with your skin type and routine.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 backdrop-blur-lg bg-red-50/90 rounded-2xl shadow-lg p-4 border border-red-200 text-red-700">
            {errorMessage}
          </div>
        )}

        {!scannedProduct && (
          <div className="space-y-6">
            <div className="backdrop-blur-lg bg-white/70 rounded-3xl shadow-xl p-8 border border-white/50">
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={scanning}
                  className="w-full aspect-square max-h-80 rounded-2xl bg-gradient-to-br from-[#8b63d3]/20 to-[#6b46b8]/20 border-4 border-dashed border-[#8b63d3]/40 hover:border-[#8b63d3]/60 transition-all duration-300 flex flex-col items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {scanning ? (
                    <>
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-[#8b63d3]/30 border-t-[#8b63d3] animate-spin" />
                        <Camera className="w-10 h-10 text-[#8b63d3] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <p className="text-lg font-semibold text-[#8b63d3]">Analyzing...</p>
                      <p className="text-sm text-gray-600">Reading product from camera photo</p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#6b46b8] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Camera className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-xl font-semibold text-gray-900">Take Product Photo</p>
                      <p className="text-sm text-gray-600">Use your camera to photograph the product</p>
                    </>
                  )}
                </button>

                <button
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={scanning}
                  className="w-full aspect-square max-h-80 rounded-2xl bg-gradient-to-br from-pink-100/70 to-purple-100/70 border-4 border-dashed border-pink-300 hover:border-pink-400 transition-all duration-300 flex flex-col items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <ImageIcon className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-xl font-semibold text-gray-900">Upload Product Image</p>
                  <p className="text-sm text-gray-600">Choose an existing product photo from gallery</p>
                </button>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-white/70 rounded-2xl shadow-lg p-6 border border-white/50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Or Search Manually</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                  placeholder="Enter product name or barcode..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-[#8b63d3] focus:ring-2 focus:ring-[#8b63d3]/20 outline-none transition-all"
                />
                <button
                  onClick={handleManualSearch}
                  className="px-6 py-3 bg-gradient-to-r from-[#8b63d3] to-[#6b46b8] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-white/70 rounded-2xl shadow-lg p-6 border border-white/50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Try These Examples</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => analyzeProduct("Vitamin C Brightening Serum")}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-[#8b63d3] hover:bg-white/50 transition-all group"
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">Excellent Match</p>
                </button>

                <button
                  onClick={() => analyzeProduct("Retinol Night Treatment")}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-[#8b63d3] hover:bg-white/50 transition-all group"
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">Use Caution</p>
                </button>

                <button
                  onClick={() => analyzeProduct("Heavy Mineral Oil Cream")}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-[#8b63d3] hover:bg-white/50 transition-all group"
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-red-100 flex items-center justify-center">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">Avoid</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {scannedProduct && (
          <div className="space-y-6 animate-fade-in">
            <div className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-xl overflow-hidden border border-white/50">
              <div className="p-6">
                <div className="flex gap-6 mb-6">
                  <img
                    src={
                      scannedProduct.image ||
                      "https://via.placeholder.com/400x400/8b63d3/ffffff?text=Product"
                    }
                    alt={scannedProduct.name}
                    className="w-32 h-32 rounded-2xl object-cover shadow-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                          {scannedProduct.name}
                        </h2>
                        <p className="text-gray-600 mb-3">{scannedProduct.brand}</p>
                      </div>
                      <button
                        onClick={() => setScannedProduct(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close results"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>

                    <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r ${getCompatibilityColor(scannedProduct.compatibility)} text-white shadow-lg`}>
                      {getCompatibilityIcon(scannedProduct.compatibility)}
                      <div>
                        <div className="text-sm font-medium opacity-90">Compatibility Score</div>
                        <div className="text-2xl font-bold">{scannedProduct.compatibilityScore}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#8b63d3]/10 to-[#6b46b8]/10 rounded-2xl p-4 border border-[#8b63d3]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#8b63d3]/20 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-[#8b63d3]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">Layering Order</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {scannedProduct.layeringOrder === 0
                          ? "Not recommended"
                          : `Step ${scannedProduct.layeringOrder} in your routine`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-xl p-6 border border-white/50">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8b63d3]" />
                Ingredient Analysis
              </h3>
              <div className="space-y-3">
                {scannedProduct.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${getIngredientColor(ingredient.status)}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{ingredient.name}</div>
                        <div className="text-sm opacity-80">{ingredient.description}</div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          ingredient.status === "beneficial"
                            ? "bg-green-200"
                            : ingredient.status === "neutral"
                              ? "bg-blue-200"
                              : "bg-red-200"
                        }`}
                      >
                        {ingredient.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {scannedProduct.conflictsWith.length > 0 && (
              <div className="backdrop-blur-lg bg-red-50/80 rounded-2xl shadow-lg p-6 border border-red-200/50">
                <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Product Conflicts
                </h3>
                <p className="text-sm text-red-800 mb-3">
                  Do not use this product with:
                </p>
                <div className="flex flex-wrap gap-2">
                  {scannedProduct.conflictsWith.map((conflict, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-lg bg-red-100 text-red-800 text-sm font-medium border border-red-200"
                    >
                      {conflict}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-xl p-6 border border-white/50">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#8b63d3]" />
                Usage Recommendations
              </h3>
              <ul className="space-y-3">
                {scannedProduct.recommendations.map((rec, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8b63d3]/20 flex items-center justify-center text-[#8b63d3] font-semibold text-sm">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 flex-1">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setScannedProduct(null)}
                className="flex-1 bg-gradient-to-r from-[#8b63d3] to-[#6b46b8] text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                Scan Another Product
              </button>
              <button
                onClick={() => navigate('/routine')}
                className="px-6 py-4 rounded-xl border-2 border-[#8b63d3] text-[#8b63d3] font-semibold hover:bg-[#8b63d3]/10 transition-all duration-300"
              >
                View My Routine
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}