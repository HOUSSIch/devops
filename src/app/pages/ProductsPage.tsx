import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { GlassCard } from "../components/GlassCard";
import { PageTransition } from "../components/PageTransition";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useCart } from "../contexts/CartContext";
import {
  ShoppingCart,
  Sparkles,
  Star,
  CheckCircle,
  Shield,
  AlertTriangle,
  Info,
  Heart,
  AlertCircle,
} from "lucide-react";

interface AnalysisConcern {
  label: string;
  severity: "Mild" | "Moderate" | "High";
  description: string;
}

interface AnalysisResult {
  skinType: string;
  healthScore: number;
  skinAge: number;
  summary: string;
  concerns: AnalysisConcern[];
  morningRoutine: Array<{
    step: string;
    product: string;
    time: string;
  }>;
  eveningRoutine: Array<{
    step: string;
    product: string;
    time: string;
  }>;
}

interface Product {
  name: string;
  brand: string;
  price: string;
  benefits: string[];
  match: number;
  image: string;
  rating: number;
  url?: string;
  safeForAllergies?: boolean;
  hasConflicts?: boolean;
  conflictWarning?: string;
  keyIngredients?: string[];
}

function isAnalysisResult(data: any): data is AnalysisResult {
  return (
    data &&
    typeof data === "object" &&
    typeof data.skinType === "string" &&
    typeof data.healthScore === "number"
  );
}

function extractAnalysisFromStorage(raw: string | null): AnalysisResult | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (isAnalysisResult(parsed)) return parsed;

    if (isAnalysisResult(parsed?.analysis)) return parsed.analysis;

    if (typeof parsed?.analysis === "string") {
      const nested = JSON.parse(parsed.analysis);
      if (isAnalysisResult(nested)) return nested;
    }

    if (isAnalysisResult(parsed?.result)) return parsed.result;

    if (typeof parsed?.result === "string") {
      const nested = JSON.parse(parsed.result);
      if (isAnalysisResult(nested)) return nested;
    }

    if (isAnalysisResult(parsed?.data)) return parsed.data;

    if (typeof parsed?.data === "string") {
      const nested = JSON.parse(parsed.data);
      if (isAnalysisResult(nested)) return nested;
    }

    if (isAnalysisResult(parsed?.aiAnalysis)) return parsed.aiAnalysis;

    if (typeof parsed?.aiAnalysis === "string") {
      const nested = JSON.parse(parsed.aiAnalysis);
      if (isAnalysisResult(nested)) return nested;
    }

    console.warn("Unknown skinAnalysisResult format:", parsed);
    return null;
  } catch (error) {
    console.error("Failed to parse skinAnalysisResult:", error);
    return null;
  }
}

export function ProductsPage() {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const savedAnalysis = localStorage.getItem("skinAnalysisResult");
        const parsedAnalysis = extractAnalysisFromStorage(savedAnalysis);

        console.log("savedAnalysis raw:", savedAnalysis);
        console.log("parsedAnalysis for products:", parsedAnalysis);

        if (!parsedAnalysis) {
          setLoadingError("No valid analysis found");
          setLoading(false);
          return;
        }

        setAnalysis(parsedAnalysis);

        const response = await fetch("http://localhost:3000/products/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsedAnalysis),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load recommended products");
        }

        setProducts(Array.isArray(data) ? data : []);
      } catch (error: any) {
        console.error("Products fetch error:", error);
        setLoadingError(error?.message || "Failed to load recommended products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getMatchColor = (match: number) => {
    if (match >= 90) return "from-emerald-500 to-teal-500";
    if (match >= 85) return "from-[#8b63d3] to-[#b89de6]";
    return "from-orange-500 to-yellow-500";
  };

  const getMatchText = (match: number) => {
    if (match >= 90) return "Excellent Match";
    if (match >= 85) return "Great Match";
    return "Good Match";
  };

  if (!analysis && !loading) {
    return (
      <PageTransition direction="left">
        <div className="min-h-screen bg-[#fbf3fe] dark:bg-[#1a0f2e] flex items-center justify-center p-6">
          <GlassCard className="text-center max-w-xl">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              No Analysis Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please complete your skin analysis first to see recommended products.
            </p>
            <Button glow onClick={() => navigate("/upload")}>
              Go to Upload
            </Button>
          </GlassCard>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition direction="left">
      <div className="min-h-screen bg-[#fbf3fe] dark:bg-[#1a0f2e] p-6 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl text-gray-800 dark:text-gray-200 mb-4">
              Recommended Products
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-xl mb-4">
              Curated specifically for your skin needs with AI + web product search
            </p>

            {analysis && (
              <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-sm text-[#8b63d3] font-semibold">
                <span>Skin Type: {analysis.skinType || "Unknown"}</span>
                <span>•</span>
                <span>Health Score: {analysis.healthScore ?? "—"}/100</span>
                <span>•</span>
                <span>
                  {(analysis.concerns?.length ?? 0)} concern
                  {(analysis.concerns?.length ?? 0) > 1 ? "s" : ""} detected
                </span>
              </div>
            )}
          </motion.div>

          {loading && (
            <GlassCard className="text-center py-16 mb-8">
              <div className="w-14 h-14 rounded-full border-4 border-[#8b63d3] border-t-transparent animate-spin mx-auto mb-4" />
              <h3 className="text-2xl text-gray-800 dark:text-gray-200 mb-2">
                Searching real products on the web...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We are matching products to your skin analysis.
              </p>
            </GlassCard>
          )}

          {!loading && loadingError && (
            <GlassCard className="text-center py-12 mb-8">
              <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
              <h3 className="text-2xl text-gray-800 dark:text-gray-200 mb-2">
                Could not load products
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{loadingError}</p>
              <Button glow onClick={() => navigate("/results")}>
                Back to Results
              </Button>
            </GlassCard>
          )}

          {!loading && !loadingError && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {products.map((product, index) => (
                  <motion.div
                    key={`${product.name}-${index}`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <GlassCard hover className="h-full flex flex-col relative">
                      <div className="absolute top-4 right-4 z-10">
                        <div
                          className={`bg-gradient-to-r ${getMatchColor(
                            product.match || 80,
                          )} text-white px-4 py-2 rounded-full text-sm flex flex-col items-center gap-1 pulse-glow shadow-lg`}
                        >
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-bold">{product.match || 80}%</span>
                          </div>
                          <span className="text-xs opacity-90">
                            {getMatchText(product.match || 80)}
                          </span>
                        </div>
                      </div>

                      {product.safeForAllergies && (
                        <div className="absolute top-4 left-4 z-10">
                          <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1 shadow-lg">
                            <Shield className="w-3 h-3" />
                            <span className="font-semibold">Safe for your profile</span>
                          </div>
                        </div>
                      )}

                      <div className="relative w-full h-64 mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col">
                        <p className="text-sm text-[#8b63d3] mb-1 font-semibold">
                          {product.brand || "Unknown Brand"}
                        </p>
                        <h3 className="text-xl text-gray-800 dark:text-gray-200 mb-2 font-bold">
                          {product.name}
                        </h3>

                        <div className="flex items-center gap-1 mb-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating || 4)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-gray-200 text-gray-200"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1 font-semibold">
                            ({product.rating || 4.5})
                          </span>
                        </div>

                        {product.hasConflicts && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                          >
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-orange-800 mb-1">
                                  Ingredient Notice
                                </p>
                                <p className="text-xs text-orange-700">
                                  {product.conflictWarning || "Use with caution in your routine."}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {!!product.keyIngredients?.length && (
                          <div className="mb-3">
                            <div className="flex items-center gap-1 mb-2">
                              <Info className="w-4 h-4 text-[#8b63d3]" />
                              <p className="text-xs font-semibold text-gray-700">
                                Key Ingredients:
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {product.keyIngredients.map((ingredient, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full border border-purple-200"
                                >
                                  {ingredient}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {!!product.benefits?.length && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {product.benefits.map((benefit, i) => (
                              <span
                                key={i}
                                className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1 font-semibold"
                              >
                                <CheckCircle className="w-3 h-3" />
                                {benefit}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-700">
                              Compatibility Analysis
                            </span>
                            <Heart className="w-4 h-4 text-[#8b63d3]" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Skin Match</span>
                              <span className="text-[#8b63d3] font-semibold">
                                {product.match || 80}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full bg-gradient-to-r ${getMatchColor(
                                  product.match || 80,
                                )}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${product.match || 80}%` }}
                                transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-purple-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl text-gray-800 dark:text-gray-200 font-bold">
                              {product.price || "View price"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {product.url ? (
                              <>
                                <Button
                                  variant="outline"
                                  className="flex-1 text-sm py-2 hover:bg-[#8b63d3] hover:text-white hover:border-[#8b63d3]"
                                  onClick={() =>
                                    window.open(product.url, "_blank", "noopener,noreferrer")
                                  }
                                >
                                  <ShoppingCart className="w-4 h-4 mr-1" />
                                  View Product
                                </Button>
                                <Button
                                  glow
                                  className="flex-1 text-sm py-2"
                                  onClick={async () => {
                                    setAddingToCart(product.name);
                                    try {
                                      await addItem({
                                        name: product.name,
                                        brand: product.brand,
                                        price: product.price,
                                        image: product.image,
                                        url: product.url || "",
                                      });
                                      setAddedToCart(product.name);
                                      setTimeout(() => setAddedToCart(null), 2000);
                                    } catch (error) {
                                      console.error("Failed to add to cart:", error);
                                    } finally {
                                      setAddingToCart(null);
                                    }
                                  }}
                                  disabled={addingToCart === product.name}
                                >
                                  {addingToCart === product.name
                                    ? "Adding..."
                                    : addedToCart === product.name
                                    ? "Added! ✓"
                                    : "Buy Now"}
                                </Button>
                              </>
                            ) : (
                              <Button
                                glow
                                className="w-full text-sm py-2"
                                onClick={() => navigate("/checkout")}
                              >
                                Continue
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mb-8"
              >
                <GlassCard className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                        AI + Web Product Matching
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        These products are fetched from the web and ranked using your skin analysis.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}