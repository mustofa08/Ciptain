// src/components/ShopCore.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Heart,
  ShoppingCart,
  Search,
  ArrowUp,
  X,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { usePreview } from "../contexts/PreviewContext";

/**
 * ShopCore
 * props:
 *  - mode: "public" | "user"  (default "public")
 *
 * Behavior:
 *  - If PreviewContext.previewMode !== "none", override effectiveMode:
 *      previewMode "public"  -> effectiveMode = "public"
 *      previewMode "user"    -> effectiveMode = "user"
 *      previewMode "mobile"  -> effectiveMode = mode but compact layout
 *      previewMode "desktop" -> effectiveMode = mode (desktop layout)
 */

export default function ShopCore({ mode = "public" }) {
  const { user } = useAuth();
  const { previewMode } = usePreview();

  // determine effective mode & compact flag
  const compactPreview = previewMode === "mobile";
  const effectiveMode =
    previewMode === "public"
      ? "public"
      : previewMode === "user"
      ? "user"
      : // if previewMode is mobile/desktop/none -> use incoming prop
        mode;

  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [categoryMap, setCategoryMap] = useState({ Semua: [] });

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedSubcategory, setSelectedSubcategory] = useState("Semua");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [viewMode, setViewMode] = useState("all"); // "all" | "favorites"
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [favPulse, setFavPulse] = useState(false);
  const prevFavCountRef = useRef(0);

  // helper: safe public url getter
  const getImageUrl = (path) => {
    if (!path) return "/src/assets/template-placeholder.jpg";
    if (path.startsWith("http")) return path;
    // supabase.storage.from(...).getPublicUrl returns { data: { publicUrl } }
    try {
      const { data } = supabase.storage.from("templates").getPublicUrl(path);
      return data?.publicUrl || "/src/assets/template-placeholder.jpg";
    } catch (err) {
      return "/src/assets/template-placeholder.jpg";
    }
  };

  // helper: angka ke kata (satu, dua, ...)
  const numberToWord = (n) => {
    const map = [
      "nol",
      "satu",
      "dua",
      "tiga",
      "empat",
      "lima",
      "enam",
      "tujuh",
      "delapan",
      "sembilan",
      "sepuluh",
    ];
    if (n >= 0 && n <= 10) return map[n];
    return n.toString();
  };

  // 🔹 Fetch templates
  useEffect(() => {
    let mounted = true;
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("templates")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        // map images to public urls
        const withUrls = (data || []).map((t) => ({
          ...t,
          image: getImageUrl(t.image),
        }));
        if (mounted) setTemplates(withUrls);
      } catch (err) {
        console.error("Gagal memuat templates:", err?.message || err);
        if (mounted) setErrorMsg("Gagal memuat data template 😢");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchTemplates();
    return () => {
      mounted = false;
    };
  }, []);

  // 🔹 Fetch categories + subcategories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: catData } = await supabase
          .from("categories")
          .select("id, name");
        const { data: subData } = await supabase
          .from("subcategories")
          .select("id, name, category_id");
        setCategories(catData || []);
        setSubcategories(subData || []);
        const map = { Semua: [] };
        (catData || []).forEach((cat) => {
          const relatedSubs = (subData || [])
            .filter((s) => s.category_id === cat.id)
            .map((s) => s.name);
          map[cat.name] = ["Semua", ...relatedSubs];
        });
        setCategoryMap(map);
      } catch (err) {
        console.warn("fetchCategories error", err);
        setCategoryMap({ Semua: [] });
      }
    };
    fetchCategories();
  }, []);

  // 🔹 Fetch favorites (only relevant for user mode)
  useEffect(() => {
    if (effectiveMode !== "user") return;
    if (!user) {
      setFavorites([]);
      prevFavCountRef.current = 0;
      return;
    }
    let mounted = true;
    const fetchFavorites = async () => {
      try {
        const { data } = await supabase
          .from("favorites")
          .select("*")
          .eq("user_id", user.id);
        if (!mounted) return;
        setFavorites(data || []);
        prevFavCountRef.current = (data || []).length;
      } catch (err) {
        console.warn("fetchFavorites error", err);
      }
    };
    fetchFavorites();
    return () => {
      mounted = false;
    };
  }, [effectiveMode, user]);

  // when favorites count increases -> pulse animation on floating button
  useEffect(() => {
    const prev = prevFavCountRef.current || 0;
    if (favorites.length > prev) {
      setFavPulse(true);
      setTimeout(() => setFavPulse(false), 700);
    }
    prevFavCountRef.current = favorites.length;
  }, [favorites.length]);

  // 🔹 Scroll-to-top button
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // toggle favorite (optimistic UI)
  const toggleFavorite = async (template) => {
    if (effectiveMode !== "user") {
      alert("Login terlebih dahulu untuk menyimpan favorit 💙");
      return;
    }
    if (!user) {
      alert("Silakan login dulu.");
      return;
    }
    const exists = favorites.some((f) => f.template_id === template.id);
    if (exists) {
      // remove
      try {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("template_id", template.id);
        setFavorites((prev) =>
          prev.filter((f) => f.template_id !== template.id)
        );
      } catch (err) {
        console.warn("gagal hapus favorit", err);
      }
    } else {
      const newFav = {
        user_id: user.id,
        template_id: template.id,
        name: template.name,
        category: template.category,
        subcategory: template.subcategory,
        price: template.price,
        image: template.image,
      };
      try {
        await supabase.from("favorites").insert([newFav]);
        // optimistic update
        setFavorites((prev) => [...prev, newFav]);
      } catch (err) {
        console.warn("gagal tambah favorit", err);
      }
    }
  };

  // 🔹 Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchCategory =
      selectedCategory === "Semua" || t.category === selectedCategory;
    const matchSubcategory =
      selectedSubcategory === "Semua" || t.subcategory === selectedSubcategory;
    const matchSearch = t.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchCategory && matchSubcategory && matchSearch;
  });

  const favoriteTemplates = templates.filter((t) =>
    favorites.some((f) => f.template_id === t.id)
  );

  // displayed templates based on tab
  const displayedTemplates =
    viewMode === "favorites" ? favoriteTemplates : filteredTemplates;

  // dynamic header text for favorites drawer
  const favoritesCount = favorites.length;
  const favoritesHeaderText = (() => {
    if (favoritesCount === 0) return "Belum ada template favorit";
    if (favoritesCount === 1) return `1 template favorit — ${numberToWord(1)}`;
    if (favoritesCount <= 10)
      return `${favoritesCount} template favorit — ${numberToWord(
        favoritesCount
      )}`;
    return `${favoritesCount} template favorit`;
  })();

  const favoritesSubText = (() => {
    if (favoritesCount === 0)
      return "Tambahkan template ke favorit untuk melihatnya di sini.";
    if (favoritesCount === 1) return "Kamu sedang menyukai 1 template.";
    return `Kamu menyukai ${favoritesCount} template.`;
  })();

  // compact layout class (for mobile preview)
  const compactCardClass = compactPreview
    ? "w-[180px]"
    : "w-[230px] md:w-[250px]";
  const compactGrid = compactPreview
    ? "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div
      className={`relative min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 py-8 px-4 md:px-8`}
    >
      {/* Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-300/20 blur-[150px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-10 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
          ✨ Jelajahi Template{" "}
          <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
            Ciptain
          </span>
        </h1>
        <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
          {effectiveMode === "user"
            ? "Temukan template terbaik dan simpan favoritmu 💙"
            : "Lihat dan pesan template profesional dengan desain elegan 💫"}
        </p>
        {previewMode !== "none" && (
          <p className="text-xs text-gray-500 mt-2">
            (Preview mode: <b>{previewMode}</b>)
          </p>
        )}
      </motion.div>

      {/* Filter + Tabs */}
      <div className="max-w-7xl mx-auto mb-10 bg-white/70 backdrop-blur-xl border border-white/40 py-4 px-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md w-full">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari template impianmu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-white/60 rounded-full shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide">
            {Object.keys(categoryMap).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedSubcategory("Semua");
                }}
                className={`px-5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-blue-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategories */}
        {selectedCategory !== "Semua" &&
          categoryMap[selectedCategory]?.length > 0 && (
            <div className="mt-3 flex gap-2 justify-center flex-wrap">
              {categoryMap[selectedCategory].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    selectedSubcategory === sub
                      ? "bg-blue-500 text-white shadow"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

        {/* Tabs */}
        {effectiveMode === "user" && (
          <div className="flex justify-center mt-6 gap-4">
            <button
              onClick={() => setViewMode("all")}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                viewMode === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Semua Template
            </button>
            <button
              onClick={() => setViewMode("favorites")}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                viewMode === "favorites"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Favorit Saya 💙
            </button>
          </div>
        )}
      </div>

      {/* Template Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Memuat template...
          </div>
        ) : errorMsg ? (
          <div className="text-center text-red-500 py-20">{errorMsg}</div>
        ) : displayedTemplates.length > 0 ? (
          <div className={`grid grid-cols-1 ${compactGrid} gap-10`}>
            {displayedTemplates.map((t) => {
              const isFav = favorites.some((f) => f.template_id === t.id);
              return (
                <TemplateCard
                  key={t.id}
                  template={t}
                  mode={effectiveMode}
                  isFav={isFav}
                  onFavorite={toggleFavorite}
                  compact={compactPreview}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-20">
            Tidak ada template ditemukan 😅
          </div>
        )}
      </div>

      {/* Floating Favorites Drawer (only for user mode) */}
      {effectiveMode === "user" && (
        <>
          <button
            onClick={() => setDrawerOpen(true)}
            className={`fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-cyan-400 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50 flex items-center justify-center ${
              favPulse ? "animate-pulse" : ""
            }`}
            aria-label="Favorit Saya"
            title={`${favoritesCount} favorit`}
          >
            <div className="relative">
              <Heart size={22} />
              {favoritesCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 bg-white text-blue-700 text-xs font-semibold rounded-full px-2 py-0.5 shadow"
                  style={{ minWidth: 20, textAlign: "center" }}
                >
                  {favoritesCount}
                </span>
              )}
            </div>
          </button>

          <AnimatePresence>
            {drawerOpen && (
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.3 }}
                className="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl border-l border-gray-100 z-[9999] p-5 overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                      <Star className="text-yellow-400" size={18} />
                      {favoritesHeaderText}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {favoritesSubText}
                    </p>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                {favoriteTemplates.length > 0 ? (
                  favoriteTemplates.map((t) => (
                    <div
                      key={t.id}
                      className="flex gap-3 items-center mb-3 border-b pb-3"
                    >
                      <img
                        src={t.image}
                        alt={t.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800">
                          {t.name}
                        </p>
                        <p className="text-xs text-gray-500">{t.price}</p>
                      </div>
                      <button
                        onClick={() => {
                          toggleFavorite(t);
                        }}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center mt-10">
                    Belum ada template favorit 😅
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-24 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all z-[9999]"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* 🔹 Template Card (supports compact) */
function TemplateCard({ template, mode, isFav, onFavorite, compact = false }) {
  const containerClass = compact ? "w-[180px]" : "w-[230px] md:w-[250px]";
  const aspect = "aspect-[9/18]";

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="relative flex flex-col items-center group transition-all duration-300"
    >
      <div
        className={`relative bg-white rounded-[2rem] shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all ${aspect} ${containerClass}`}
      >
        <img
          src={template.image}
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <motion.div
          whileTap={{ scale: 1.1 }}
          onClick={() => onFavorite(template)}
          className={`absolute z-10 top-3 right-3 p-2 rounded-full shadow-md cursor-pointer backdrop-blur-sm transition-all ${
            isFav ? "bg-red-100/90" : "bg-white/70 hover:bg-white/90"
          }`}
          title={isFav ? "Hapus favorit" : "Tambah favorit"}
        >
          <Heart
            size={18}
            className={`transition ${
              isFav
                ? "text-red-500 fill-red-500"
                : "text-gray-600 hover:text-red-400"
            }`}
          />
        </motion.div>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col justify-center items-center text-white space-y-3">
          <Link
            to={`/template/${template.id}`}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md transition"
          >
            <Eye size={16} /> Lihat Detail
          </Link>
          <button
            onClick={() => {
              if (mode === "user") {
                window.location.href = `/user/order/${template.id}`;
              } else {
                // for public preview open order route but show login later
                window.location.href = `/user/order/${template.id}`;
              }
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm transition"
          >
            <ShoppingCart size={16} /> Order
          </button>
        </div>
      </div>

      <div className="text-center mt-4">
        <h3 className="text-base font-semibold text-gray-800">
          {template.name}
        </h3>
        <p className="text-sm text-gray-500">
          {template.category} • {template.subcategory || "-"}
        </p>
        <p className="text-blue-600 font-semibold mt-1">{template.price}</p>
      </div>
    </motion.div>
  );
}
