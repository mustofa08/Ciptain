// src/pages/Shop.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Heart, ShoppingCart, X, Search, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

/* --------------------------
   Contoh Data Template
-------------------------- */
const templates = [
  {
    id: 1,
    name: "Elegant Wedding",
    category: "Undangan",
    subcategory: "Wedding",
    price: "Gratis",
    image: "/src/assets/template1.jpg",
  },
  {
    id: 2,
    name: "Birthday Celebration",
    category: "Undangan",
    subcategory: "Birthday",
    price: "Rp 10.000",
    image: "/src/assets/template2.jpg",
  },
  {
    id: 3,
    name: "Classic Wedding",
    category: "Undangan",
    subcategory: "Wedding",
    price: "Rp 15.000",
    image: "/src/assets/template3.jpg",
  },
  {
    id: 4,
    name: "Modern CV",
    category: "Portofolio",
    subcategory: "Photographer",
    price: "Gratis",
    image: "/src/assets/template4.jpg",
  },
  {
    id: 5,
    name: "Creative Studio",
    category: "Portofolio",
    subcategory: "Designer",
    price: "Rp 30.000",
    image: "/src/assets/template5.jpg",
  },
  {
    id: 6,
    name: "Developer Showcase",
    category: "Portofolio",
    subcategory: "Developer",
    price: "Rp 25.000",
    image: "/src/assets/template4.jpg",
  },
];

const categoryMap = {
  Semua: [],
  Undangan: ["Semua", "Wedding", "Birthday", "Graduation"],
  Portofolio: ["Semua", "Designer", "Photographer", "Developer"],
};

export default function Shop() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedSubcategory, setSelectedSubcategory] = useState("Semua");
  const [favorites, setFavorites] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loadingFav, setLoadingFav] = useState(true);

  /* --------------------------
     🧠 Ambil favorit dari Supabase saat login
  -------------------------- */
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoadingFav(true);

      if (!user) {
        // Kalau logout, kosongkan favorites (tidak aktif)
        setFavorites([]);
        setLoadingFav(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Gagal memuat favorit:", error);
      } else {
        const mapped = data.map((fav) => ({
          id: fav.template_id,
          name: fav.name,
          category: fav.category,
          subcategory: fav.subcategory,
          price: fav.price,
          image: fav.image,
        }));
        setFavorites(mapped);
      }

      setLoadingFav(false);
    };

    fetchFavorites();
  }, [user]);

  /* --------------------------
     🔁 Scroll detection (back to top button)
  -------------------------- */
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* --------------------------
     ❤️ Toggle Favorit (dengan proteksi login)
  -------------------------- */
  const toggleFavorite = async (template) => {
    if (!user) {
      alert("Login dulu untuk menyimpan favorit 😊");
      return; // stop, tidak ubah state
    }

    const exists = favorites.some((fav) => fav.id === template.id);

    if (exists) {
      setFavorites((prev) => prev.filter((fav) => fav.id !== template.id));
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("template_id", template.id);
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
      setFavorites((prev) => [...prev, template]);
      await supabase.from("favorites").insert([newFav]);
    }
  };

  const removeFavorite = async (id) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
    if (user) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("template_id", id);
    }
  };

  /* --------------------------
     🔍 Filter Template
  -------------------------- */
  const filteredTemplates = templates.filter((item) => {
    const matchesCategory =
      selectedCategory === "Semua" || item.category === selectedCategory;
    const matchesSubcategory =
      selectedSubcategory === "Semua" ||
      item.subcategory === selectedSubcategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  /* --------------------------
     🖼️ UI Render
  -------------------------- */
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 py-8 px-4 md:px-8">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          🎨 Pilih Template <span className="text-blue-600">Ciptain</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Temukan template undangan & portofolio yang cocok dengan gayamu.
        </p>
      </div>

      {/* STICKY FILTER BAR */}
      <div className="sticky top-0 z-40">
        <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-md border-b border-gray-200 py-3 px-4 md:px-6 rounded-b-xl shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
              />
            </div>

            {/* KATEGORI */}
            <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide">
              {Object.keys(categoryMap).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedSubcategory("Semua");
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* SUBKATEGORI */}
          {selectedCategory !== "Semua" &&
            categoryMap[selectedCategory]?.length > 0 && (
              <div className="mt-3 flex gap-2 items-center overflow-x-auto scrollbar-hide px-1">
                {categoryMap[selectedCategory].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`px-3 py-1 rounded-full text-sm transition whitespace-nowrap ${
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
        </div>
      </div>

      {/* GRID TEMPLATE */}
      <div className="max-w-7xl mx-auto mt-8">
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredTemplates.map((template) => {
              const isFav = favorites.some((fav) => fav.id === template.id);
              return (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.03 }}
                  className="relative flex flex-col items-center group transition-all duration-300"
                >
                  <div className="relative bg-gradient-to-b from-gray-100 to-gray-200 rounded-[2.5rem] shadow-xl overflow-hidden border-[6px] border-[#111] aspect-[9/19] w-[220px] md:w-[250px]">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-18 md:w-20 h-4 bg-[#111] rounded-full"></div>
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-gray-400 rounded-full opacity-40"></div>

                    <img
                      src={template.image}
                      alt={template.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* ❤️ Tombol Favorit */}
                    <motion.div
                      whileTap={{ scale: 1.2 }}
                      onClick={() => toggleFavorite(template)}
                      className={`absolute z-10 top-3 right-3 p-2 rounded-full shadow-md cursor-pointer hover:scale-110 transition-all backdrop-blur-sm ${
                        isFav ? "bg-red-100" : "bg-white/80"
                      }`}
                      style={{
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        border: "1px solid rgba(255,255,255,0.4)",
                      }}
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

                    {/* Overlay Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col justify-center items-center text-white space-y-3">
                      <Link
                        to={`/template/${template.id}`}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md transition"
                      >
                        <Eye size={16} /> Lihat Detail
                      </Link>
                      <Link
                        to={`/order/${template.id}`}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm transition"
                      >
                        <ShoppingCart size={16} /> Order
                      </Link>
                    </div>
                  </div>

                  {/* Info Bawah */}
                  <div className="text-center mt-4">
                    <h3 className="text-base font-semibold text-gray-800">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {template.category} • {template.subcategory} •{" "}
                      {template.price}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-20">
            Tidak ada template ditemukan 😅
          </div>
        )}
      </div>

      {/* ❤️ Sidebar Favorit */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.36 }}
            className="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl border-l border-gray-200 p-6 z-50 flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                ❤️ Favoritmu
              </h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={22} />
              </button>
            </div>

            {favorites.length === 0 ? (
              <p className="text-gray-500 text-sm mt-6">Belum ada favorit 😅</p>
            ) : (
              <div className="space-y-4 overflow-y-auto">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="flex items-center gap-3 border-b pb-2"
                  >
                    <img
                      src={fav.image}
                      alt={fav.name}
                      className="w-14 h-14 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-800">
                        {fav.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {fav.category} • {fav.subcategory} • {fav.price}
                      </p>
                    </div>
                    <Heart
                      size={18}
                      onClick={() => removeFavorite(fav.id)}
                      className="text-red-500 fill-red-500 cursor-pointer hover:scale-110 transition"
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.07 }}
        onClick={() => setShowSidebar((s) => !s)}
        className="fixed bottom-8 right-8 bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition z-50"
      >
        <Heart size={24} className={favorites.length ? "fill-white" : ""} />
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-red-500 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {favorites.length}
          </span>
        )}
      </motion.button>

      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </div>
  );
}
