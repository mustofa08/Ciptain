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

export default function ShopCore({ mode = "public" }) {
  const { user } = useAuth();

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

  const getImageUrl = (path) => {
    if (!path) return "/src/assets/template-placeholder.jpg";
    if (path.startsWith("http")) return path;
    const { data } = supabase.storage.from("templates").getPublicUrl(path);
    return data?.publicUrl || "/src/assets/template-placeholder.jpg";
  };

  // helper: ubah angka kecil ke kata (satu, dua, ...)
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
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("templates")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        const withUrls = data.map((t) => ({
          ...t,
          image: getImageUrl(t.image),
        }));
        setTemplates(withUrls);
      } catch {
        setErrorMsg("Gagal memuat data template 😢");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
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
        catData?.forEach((cat) => {
          const relatedSubs = subData
            .filter((s) => s.category_id === cat.id)
            .map((s) => s.name);
          map[cat.name] = ["Semua", ...relatedSubs];
        });
        setCategoryMap(map);
      } catch {
        setCategoryMap({ Semua: [] });
      }
    };
    fetchCategories();
  }, []);

  // 🔹 Fetch favorites
  useEffect(() => {
    if (mode !== "user" || !user) return;
    const fetchFavorites = async () => {
      const { data } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id);
      if (data) setFavorites(data);
      prevFavCountRef.current = data?.length || 0;
    };
    fetchFavorites();
  }, [mode, user]);

  // when favorites count changes -> pulse animation on floating button
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

  const toggleFavorite = async (template) => {
    if (mode !== "user") {
      alert("Login terlebih dahulu untuk menyimpan favorit 💙");
      return;
    }
    const exists = favorites.some((f) => f.template_id === template.id);
    if (exists) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("template_id", template.id);
      setFavorites((prev) => prev.filter((f) => f.template_id !== template.id));
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
      await supabase.from("favorites").insert([newFav]);
      // insert returns nothing consistent; just optimis update
      setFavorites((prev) => [...prev, newFav]);
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

  // 🔹 Template list based on tab
  const displayedTemplates =
    viewMode === "favorites" ? favoriteTemplates : filteredTemplates;

  // dynamic header text for favorites drawer
  const favoritesCount = favorites.length;
  const favoritesHeaderText = (() => {
    if (favoritesCount === 0) return "Belum ada template favorit";
    if (favoritesCount === 1) return `1 template favorit — ${numberToWord(1)}`;
    // for readability, show number + word for small counts
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

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 py-8 px-4 md:px-8">
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
          {mode === "user"
            ? "Temukan template terbaik dan simpan favoritmu 💙"
            : "Lihat dan pesan template profesional dengan desain elegan 💫"}
        </p>
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
        {mode === "user" && (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {displayedTemplates.map((t) => {
              const isFav = favorites.some((f) => f.template_id === t.id);
              return (
                <TemplateCard
                  key={t.id}
                  template={t}
                  mode={mode}
                  isFav={isFav}
                  onFavorite={toggleFavorite}
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

      {/* Floating Favorites Drawer */}
      {mode === "user" && (
        <>
          <button
            onClick={() => setDrawerOpen(true)}
            className={`fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-cyan-400 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50 flex items-center justify-center ${
              favPulse ? "animate-pulse" : ""
            }`}
            aria-label="Favorit Saya"
          >
            <div className="relative">
              <Heart size={22} />
              {/* badge count */}
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
                          // remove from favorites quickly in UI
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

/* 🔹 Template Card */
function TemplateCard({ template, mode, isFav, onFavorite }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="relative flex flex-col items-center group transition-all duration-300"
    >
      <div className="relative bg-white rounded-[2rem] shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-blue-100 transition-all aspect-[9/18] w-[230px] md:w-[250px]">
        <img
          src={template.image}
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <motion.div
          whileTap={{ scale: 1.2 }}
          onClick={() => onFavorite(template)}
          className={`absolute z-10 top-3 right-3 p-2 rounded-full shadow-md cursor-pointer backdrop-blur-sm transition-all ${
            isFav ? "bg-red-100/90" : "bg-white/70 hover:bg-white/90"
          }`}
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
                alert("Silakan login terlebih dahulu untuk melakukan order 💬");
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
