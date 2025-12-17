import React, { useState, useEffect, useRef } from "react";
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

  // simpan image lama untuk auto delete
  const oldImageRef = useRef(null);

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

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    fetchTemplates();
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });
    setTemplates(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    setCategories(data || []);
  };

  const fetchSubcategories = async () => {
    const { data } = await supabase
      .from("subcategories")
      .select("*")
      .order("name");
    setSubcategories(data || []);
  };

  /* ================= IMAGE ================= */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // auto delete image lama saat edit
      if (editing && oldImageRef.current) {
        const oldPath = oldImageRef.current.split("/").pop();
        await supabase.storage.from("templates").remove([oldPath]);
      }

      const filePath = `${Date.now()}-${file.name}`;
      await supabase.storage.from("templates").upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

      const { data } = supabase.storage
        .from("templates")
        .getPublicUrl(filePath);

      setFormData((p) => ({ ...p, image: data.publicUrl }));
      oldImageRef.current = data.publicUrl;
    } catch {
      alert("Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!formData.image) return;

    const path = formData.image.split("/").pop();
    await supabase.storage.from("templates").remove([path]);

    setFormData((p) => ({ ...p, image: "" }));
    oldImageRef.current = null;
  };

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id || !formData.name || !formData.category || !formData.price)
      return alert("Lengkapi data wajib");

    setLoading(true);

    if (editing) {
      await supabase.from("templates").update(formData).eq("id", editing.id);
    } else {
      await supabase.from("templates").insert([formData]);
    }

    fetchTemplates();
    resetForm();
    setLoading(false);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    oldImageRef.current = null;
    setFormData({
      id: "",
      name: "",
      category: "",
      subcategory: "",
      price: "",
      image: "",
    });
  };

  /* ================= EDIT ================= */
  const handleEdit = (t) => {
    setEditing(t);
    oldImageRef.current = t.image || null;
    setFormData(t);
    setShowForm(true);
    setShowCatForm(false);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id, name, image) => {
    if (!window.confirm(`Hapus ${name}?`)) return;

    if (image) {
      const path = image.split("/").pop();
      await supabase.storage.from("templates").remove([path]);
    }

    await supabase.from("templates").delete().eq("id", id);
    fetchTemplates();
  };

  /* ================= CATEGORY ================= */
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCat) return;
    await supabase.from("categories").insert([{ name: newCat }]);
    setNewCat("");
    fetchCategories();
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    if (!newSub.name || !newSub.category_id) return;
    await supabase.from("subcategories").insert([newSub]);
    setNewSub({ name: "", category_id: "" });
    fetchSubcategories();
  };

  const formatRupiah = (v) =>
    "Rp " + new Intl.NumberFormat("id-ID").format(v.replace(/\D/g, ""));

  /* ================= UI ================= */
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
            onClick={() => {
              setShowCatForm(true);
              setShowForm(false);
              setEditing(null);
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-md"
          >
            🗂️ Kelola Kategori
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              setShowForm(true);
              setShowCatForm(false);
              setEditing(null);
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
          >
            <Plus size={18} /> Tambah Template
          </motion.button>
        </div>
      </div>

      {/* FORM KELOLA KATEGORI */}
      <AnimatePresence>
        {showCatForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border rounded-2xl p-6 shadow-md mb-8"
          >
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold">🗂️ Kelola Kategori</h2>
              <button onClick={() => setShowCatForm(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-3 mb-4">
              <input
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2"
                placeholder="Nama kategori"
              />
              <button className="bg-blue-600 text-white px-4 rounded-lg">
                Tambah
              </button>
            </form>

            <form
              onSubmit={handleAddSubcategory}
              className="grid grid-cols-3 gap-3"
            >
              <select
                value={newSub.category_id}
                onChange={(e) =>
                  setNewSub((p) => ({ ...p, category_id: e.target.value }))
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                value={newSub.name}
                onChange={(e) =>
                  setNewSub((p) => ({ ...p, name: e.target.value }))
                }
                className="border rounded-lg px-3 py-2"
                placeholder="Subkategori"
              />

              <button className="bg-green-600 text-white rounded-lg">
                Tambah
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORM TEMPLATE */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border rounded-2xl p-6 shadow-md mb-8"
          >
            <h2 className="text-lg font-semibold mb-4">
              {editing ? "✏️ Edit Template" : "➕ Tambah Template Baru"}
            </h2>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <Input
                label="ID Template *"
                value={formData.id}
                disabled={!!editing}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
              />

              <Input
                label="Nama Template *"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <Input
                label="Harga *"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: formatRupiah(e.target.value),
                  })
                }
              />

              <Select
                label="Kategori *"
                value={formData.category}
                options={categories.map((c) => c.name)}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />

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

                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2">
                    {uploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    {formData.image ? "Ganti Gambar" : "Upload Gambar"}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>

                  {formData.image && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-red-600 flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Hapus Foto
                    </button>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 px-4 py-2 rounded-lg"
                >
                  <X size={16} /> Batal
                </button>

                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  {editing ? " Simpan" : " Tambah"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIST TEMPLATE */}
      <div className="bg-white border rounded-2xl p-6 shadow-md">
        <h2 className="font-semibold mb-4">
          📁 Daftar Template ({templates.length})
        </h2>

        {templates.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada template 😅</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {templates.map((t) => (
              <motion.div
                key={t.id}
                whileHover={{ scale: 1.03 }}
                className="border rounded-xl overflow-hidden bg-gray-50"
              >
                <div className="h-48 bg-gray-100">
                  {t.image && (
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold truncate">{t.name}</h3>
                  <p className="text-sm text-gray-500">
                    {t.category} • {t.subcategory || "-"}
                  </p>
                  <p className="text-blue-600 mt-1">{t.price}</p>

                  <div className="flex justify-between mt-3">
                    <button
                      onClick={() => handleEdit(t)}
                      className="text-blue-600 flex items-center gap-1"
                    >
                      <Edit size={14} /> Edit
                    </button>

                    <button
                      onClick={() => handleDelete(t.id, t.name, t.image)}
                      className="text-red-600 flex items-center gap-1"
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

/* ===== HELPERS ===== */
function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input {...props} className="w-full border rounded-lg px-3 py-2 mt-1" />
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg px-3 py-2 mt-1"
      >
        <option value="">Pilih</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
