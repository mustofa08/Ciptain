// src/pages/Order.jsx
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

/* Data template sementara */
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
];

// Nomor WhatsApp admin
const ADMIN_WA = "6282211370354"; // Ganti dengan nomor kamu (gunakan format internasional tanpa "+62")

export default function Order() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const template = templates.find((t) => t.id === parseInt(id));

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || "",
    email: user?.email || "",
    phone: "",
    note: "",
    payment: "Transfer Bank",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Login dulu sebelum melakukan order 😊");
      navigate("/login");
      return;
    }

    if (!formData.phone.match(/^\d{10,15}$/)) {
      alert("Nomor WhatsApp tidak valid (hanya angka, 10–15 digit).");
      return;
    }

    setLoading(true);

    // Simpan ke database
    const { error } = await supabase.from("orders").insert([
      {
        user_id: user.id,
        template_id: template.id,
        template_name: template.name,
        price: template.price,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        note: formData.note,
        payment_method: formData.payment,
        status: "Menunggu Pembayaran",
      },
    ]);

    if (error) {
      console.error("Gagal menyimpan order:", error);
      alert("Terjadi kesalahan saat memproses order 😥");
      setLoading(false);
      return;
    }

    // Siapkan pesan WhatsApp otomatis
    const message = encodeURIComponent(
      `Halo Admin 👋\n\nSaya ingin melakukan pemesanan template di *Ciptain*.\n\n🧾 *Detail Order:*\n• Nama: ${
        formData.name
      }\n• Email: ${formData.email}\n• No. WhatsApp: ${
        formData.phone
      }\n• Template: ${template.name}\n• Kategori: ${template.category} (${
        template.subcategory
      })\n• Harga: ${template.price}\n• Metode Pembayaran: ${
        formData.payment
      }\n\n📝 Catatan:\n${formData.note || "-"}\n\nTerima kasih! 🙌`
    );

    // Buka WhatsApp admin dengan pesan otomatis
    const waURL = `https://wa.me/${ADMIN_WA}?text=${message}`;
    window.open(waURL, "_blank");

    setSuccess(true);
    setLoading(false);
  };

  if (!template)
    return (
      <div className="text-center py-20 text-gray-500 text-lg">
        Template tidak ditemukan 😅 <br />
        <Link to="/shop" className="text-blue-600 underline mt-2 inline-block">
          Kembali ke Shop
        </Link>
      </div>
    );

  if (success)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50 text-center">
        <CheckCircle className="text-green-500 mb-4" size={70} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Order Berhasil!
        </h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Terima kasih, pesananmu sedang diproses 💙
          <br />
          Kamu akan diarahkan ke WhatsApp admin untuk konfirmasi.
        </p>
        <Link
          to="/shop"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium shadow-md transition"
        >
          Kembali ke Shop
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg p-8 md:p-12 relative">
        {/* Tombol kembali */}
        <Link
          to="/shop"
          className="absolute top-6 left-6 text-gray-500 hover:text-blue-600 flex items-center gap-1 transition"
        >
          <ArrowLeft size={18} /> Kembali
        </Link>

        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          🛒 Order Template
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Kiri - Preview Template */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner"
          >
            <img
              src={template.image}
              alt={template.name}
              className="rounded-2xl shadow-lg mb-5 w-full"
            />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {template.name}
            </h2>
            <p className="text-gray-500 mb-2">
              {template.category} • {template.subcategory}
            </p>
            <p className="text-blue-600 font-bold text-lg">{template.price}</p>
          </motion.div>

          {/* Kanan - Form Order */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-5"
          >
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Nama kamu"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="contoh@email.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor WhatsApp
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="08xxxxxxxxxx"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan Tambahan
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows="3"
                placeholder="Contoh: ubah warna utama jadi biru muda"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Pembayaran */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metode Pembayaran
              </label>
              <select
                name="payment"
                value={formData.payment}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option>Transfer Bank</option>
                <option>QRIS</option>
                <option>GoPay</option>
                <option>OVO</option>
                <option>Dana</option>
              </select>
            </div>

            {/* Tombol Submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              disabled={loading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-lg flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Memproses...
                </>
              ) : (
                "Konfirmasi Order"
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
