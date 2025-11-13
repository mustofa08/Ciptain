import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit, Upload, X, Check, Loader2 } from "lucide-react";

export default function ManageTemplates() {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "",
    subcategory: "",
    price: "",
    image: "",
  });

  const [newCat, setNewCat] = useState("");
  const [newSub, setNewSub] = useState({ name: "", category_id: "" });

  // =====================================================
  // 🔹 Ambil data dari Supabase
  // =====================================================
  useEffect(() => {
    fetchTemplates();
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setTemplates(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    setCategories(data || []);
  };

  const fetchSubcategories = async () => {
    const { data } = await supabase
      .from("subcategories")
      .select("*, categories(name)")
      .order("name", { ascending: true });
    setSubcategories(data || []);
  };

  // =====================================================
  // 🖼 Upload Gambar ke Supabase Storage
  // =====================================================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // 🔧 Jangan tulis "templates/" lagi di path karena sudah .from("templates")
      const filePath = `${Date.now()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from("templates") // bucket name
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (error) throw error;

      // Dapatkan public URL
      const { data: publicData } = supabase.storage
        .from("templates")
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, image: publicData.publicUrl }));
    } catch (err) {
      console.error("❌ Gagal upload:", err.message);
      alert("Gagal mengunggah gambar, periksa konfigurasi Supabase Storage.");
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // 💾 Simpan atau Update Template
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.id ||
      !formData.name ||
      !formData.category ||
      !formData.price
    ) {
      alert("Harap isi semua data wajib termasuk ID!");
      return;
    }

    if (!editing && templates.some((t) => t.id === formData.id)) {
      alert("ID sudah digunakan, silakan gunakan ID lain.");
      return;
    }

    setLoading(true);

    try {
      if (editing) {
        await supabase.from("templates").update(formData).eq("id", editing.id);
        alert("✅ Template berhasil diperbarui!");
      } else {
        await supabase.from("templates").insert([formData]);
        alert("🎉 Template baru berhasil ditambahkan!");
      }

      fetchTemplates();
      setFormData({
        id: "",
        name: "",
        category: "",
        subcategory: "",
        price: "",
        image: "",
      });
      setEditing(null);
      setShowForm(false);
    } catch (err) {
      console.error("❌ Gagal menyimpan template:", err);
      alert("Terjadi kesalahan saat menyimpan template.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // 🗑️ Hapus Template
  // =====================================================
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus template "${name}"?`)) return;
    await supabase.from("templates").delete().eq("id", id);
    alert("🗑️ Template dihapus");
    fetchTemplates();
  };

  // =====================================================
  // ✏️ Edit Template
  // =====================================================
  const handleEdit = (t) => {
    setEditing(t);
    setFormData(t);
    setShowForm(true);
  };

  // =====================================================
  // 🟢 Tambah Kategori / Subkategori
  // =====================================================
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCat) return;
    await supabase.from("categories").insert([{ name: newCat }]);
    setNewCat("");
    fetchCategories();
    alert("✅ Kategori baru ditambahkan!");
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    if (!newSub.name || !newSub.category_id) return;
    await supabase.from("subcategories").insert([newSub]);
    setNewSub({ name: "", category_id: "" });
    fetchSubcategories();
    alert("✅ Subkategori baru ditambahkan!");
  };

  // =====================================================
  // 💰 Format Harga Rupiah
  // =====================================================
  const formatRupiah = (value) => {
    if (!value) return "";
    const numberString = value.replace(/[^\d]/g, "");
    return "Rp " + new Intl.NumberFormat("id-ID").format(numberString);
  };

  // =====================================================
  // 🧠 UI
  // =====================================================
  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">
            🎨 Kelola Template
          </h1>
          <p className="text-gray-600 mt-1">
            Tambah, ubah, dan hapus template dengan mudah.
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowCatForm(true)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-md"
          >
            🗂️ Kelola Kategori
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              setShowForm((p) => !p);
              setEditing(null);
              setFormData({
                id: "",
                name: "",
                category: "",
                subcategory: "",
                price: "",
                image: "",
              });
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
          >
            <Plus size={18} /> Tambah Template
          </motion.button>
        </div>
      </div>

      {/* FORM TAMBAH / EDIT TEMPLATE */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md mb-8"
          >
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              {editing ? "✏️ Edit Template" : "➕ Tambah Template Baru"}
            </h2>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              {/* ID */}
              <Input
                label="ID Template *"
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
                disabled={!!editing}
                placeholder="contoh: wedding-001"
                required
              />
              {/* Nama */}
              <Input
                label="Nama Template *"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              {/* Harga */}
              <Input
                label="Harga *"
                value={formData.price}
                onChange={(e) => {
                  const numeric = e.target.value.replace(/[^\d]/g, "");
                  setFormData({ ...formData, price: formatRupiah(numeric) });
                }}
                placeholder="Contoh: Rp 25.000"
                required
              />
              {/* Kategori */}
              <Select
                label="Kategori *"
                value={formData.category}
                options={categories.map((c) => c.name)}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              />
              {/* Subkategori */}
              <Select
                label="Subkategori"
                value={formData.subcategory}
                options={subcategories
                  .filter(
                    (s) =>
                      s.category_id ===
                      categories.find((c) => c.name === formData.category)?.id
                  )
                  .map((s) => s.name)}
                onChange={(e) =>
                  setFormData({ ...formData, subcategory: e.target.value })
                }
              />

              {/* Gambar */}
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">
                  Gambar Preview *
                </label>
                <div className="flex items-center gap-4 mt-1">
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="preview"
                      className="w-20 h-20 rounded-lg object-cover border"
                    />
                  )}
                  <label
                    className={`cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 ${
                      uploading && "opacity-50 pointer-events-none"
                    }`}
                  >
                    {uploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    {formData.image ? "Ganti Gambar" : "Upload Gambar"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Tombol Simpan */}
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                >
                  <X size={16} /> Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  {editing ? "Simpan Perubahan" : "Tambah Template"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DAFTAR TEMPLATE */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          📁 Daftar Template ({templates.length})
        </h2>

        {loading ? (
          <p className="text-gray-500 text-center py-6">Memuat data...</p>
        ) : templates.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            Belum ada template 😅
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {templates.map((t) => (
              <motion.div
                key={t.id}
                whileHover={{ scale: 1.03 }}
                className="border rounded-xl shadow-sm overflow-hidden bg-gray-50"
              >
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 text-left">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {t.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {t.category} • {t.subcategory || "-"}
                  </p>
                  <p className="text-blue-600 font-medium mt-1">{t.price}</p>
                  <div className="flex justify-between mt-3">
                    <button
                      onClick={() => handleEdit(t)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Komponen kecil bantu ===== */
function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        {...props}
        className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
      />
    </div>
  );
}

function Select({ label, value, options, onChange, required }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
      >
        <option value="">Pilih</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
