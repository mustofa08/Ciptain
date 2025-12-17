import React from "react";
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

export default function Shop() {
  const { user, profile } = useAuth();

  /* ================= PERMISSION ================= */
  const isLoggedIn = !!user;
  const isUser = profile?.role === "user";
  const canFavorite = isUser;
  const canOrder = isUser;

  /* ================= STATE ================= */
  const [templates, setTemplates] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [categoryMap, setCategoryMap] = useState({ Semua: [] });

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedSubcategory, setSelectedSubcategory] = useState("Semua");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [viewMode, setViewMode] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [favPulse, setFavPulse] = useState(false);
  const prevFavCountRef = useRef(0);

  /* ================= HELPERS ================= */
  const getImageUrl = (path) => {
    if (!path) return "/src/assets/template-placeholder.jpg";
    if (path.startsWith("http")) return path;
    const { data } = supabase.storage.from("templates").getPublicUrl(path);
    return data?.publicUrl || "/src/assets/template-placeholder.jpg";
  };

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
    return map[n] || n.toString();
  };

  /* ================= FETCH TEMPLATES ================= */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("templates")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (mounted) {
          setTemplates(
            (data || []).map((t) => ({
              ...t,
              image: getImageUrl(t.image),
            }))
          );
        }
      } catch {
        if (mounted) setErrorMsg("Gagal memuat template 😢");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  /* ================= FETCH CATEGORY ================= */
  useEffect(() => {
    (async () => {
      try {
        const { data: cats } = await supabase
          .from("categories")
          .select("id,name");

        const { data: subs } = await supabase
          .from("subcategories")
          .select("name,category_id");

        const map = { Semua: [] };
        (cats || []).forEach((c) => {
          map[c.name] = [
            "Semua",
            ...(subs || [])
              .filter((s) => s.category_id === c.id)
              .map((s) => s.name),
          ];
        });

        setCategoryMap(map);
      } catch {
        setCategoryMap({ Semua: [] });
      }
    })();
  }, []);

  /* ================= FAVORITES ================= */
  useEffect(() => {
    if (!canFavorite) {
      setFavorites([]);
      return;
    }

    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id);

      if (mounted) {
        setFavorites(data || []);
        prevFavCountRef.current = (data || []).length;
      }
    })();

    return () => (mounted = false);
  }, [canFavorite, user]);

  useEffect(() => {
    if (favorites.length > prevFavCountRef.current) {
      setFavPulse(true);
      setTimeout(() => setFavPulse(false), 700);
    }
    prevFavCountRef.current = favorites.length;
  }, [favorites]);

  /* ================= FAVORITE ACTION ================= */
  const toggleFavorite = async (tpl) => {
    if (!canFavorite) {
      alert("Fitur favorit hanya untuk user 👤");
      return;
    }

    const exists = favorites.some((f) => f.template_id === tpl.id);

    if (exists) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("template_id", tpl.id);

      setFavorites((f) => f.filter((x) => x.template_id !== tpl.id));
    } else {
      const payload = {
        user_id: user.id,
        template_id: tpl.id,
        name: tpl.name,
        category: tpl.category,
        subcategory: tpl.subcategory,
        price: tpl.price,
        image: tpl.image,
      };

      await supabase.from("favorites").insert([payload]);
      setFavorites((f) => [...f, payload]);
    }
  };

  /* ================= FILTER ================= */
  const filteredTemplates = templates.filter((t) => {
    const c = selectedCategory === "Semua" || t.category === selectedCategory;
    const s =
      selectedSubcategory === "Semua" || t.subcategory === selectedSubcategory;
    const q = t.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return c && s && q;
  });

  const favoriteTemplates = templates.filter((t) =>
    favorites.some((f) => f.template_id === t.id)
  );

  const displayedTemplates =
    viewMode === "favorites" ? favoriteTemplates : filteredTemplates;

  /* ================= FAVORITE TEXT ================= */
  const favoritesCount = favorites.length;

  const favoritesHeaderText =
    favoritesCount === 0
      ? "Belum ada favorit"
      : `${favoritesCount} template favorit — ${numberToWord(favoritesCount)}`;

  const favoritesSubText =
    favoritesCount === 0
      ? "Tambahkan template ke favorit."
      : `Kamu menyukai ${favoritesCount} template.`;

  /* ================= RENDER ================= */
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
          {isUser
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
        {isUser && (
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
                  canOrder={canOrder}
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

      {/* Floating Favorites Drawer (only for user mode) */}
      {isUser && (
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

/* ================= CARD ================= */
function TemplateCard({ template, canOrder, isFav, onFavorite }) {
  const containerClass = "w-[230px] md:w-[250px]";
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
              if (!canOrder) {
                alert("Login sebagai user untuk melakukan order 👤");
                return;
              }
              window.location.href = `/user/order/${template.id}`;
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
