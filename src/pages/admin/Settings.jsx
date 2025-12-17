import React from "react";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Upload,
  Save,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function Settings() {
  const { user, profile } = useAuth();
  const [username, setUsername] = useState(profile?.username || "");
  const [email] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(profile?.avatar_url || "");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  // 🔹 Simpan perubahan profil
  const handleSaveProfile = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username, avatar_url: avatar })
      .eq("id", user.id);

    if (!error) {
      setSuccessMsg("✅ Profil berhasil diperbarui!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
    setLoading(false);
  };

  // 🔹 Upload foto profil
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const filePath = `avatars/${user.id}-${file.name}`;
    setLoading(true);

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (error) {
      alert("Gagal upload foto profil 😢");
      setLoading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setAvatar(data.publicUrl);
    await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", user.id);
    setLoading(false);
  };

  // 🔹 Ganti password
  const handlePasswordChange = async () => {
    if (password.length < 6) {
      setPasswordMsg("❌ Password minimal 6 karakter!");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setPasswordMsg("❌ Gagal mengubah password, coba lagi!");
    } else {
      setPasswordMsg("✅ Password berhasil diubah 🎉");
      setPassword("");
      setShowPasswordForm(false);
    }

    setLoading(false);
    setTimeout(() => setPasswordMsg(""), 3000);
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-16 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl border border-gray-200 p-8">
        {/* Judul Halaman */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          ⚙️ Pengaturan Admin
        </h1>

        {/* Notifikasi sukses */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-100 text-green-800 px-4 py-2 rounded-lg text-center shadow-sm border border-green-300"
          >
            {successMsg}
          </motion.div>
        )}

        {/* Bagian Profil */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
            👤 Informasi Profil
          </h2>

          <div className="flex flex-col items-center mb-6">
            <motion.img
              src={avatar || "/default-avatar.png"}
              alt="avatar"
              className="w-28 h-28 rounded-full border-4 border-blue-200 shadow-sm object-cover"
              whileHover={{ scale: 1.05 }}
            />
            <label className="cursor-pointer mt-3 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium transition">
              <Upload size={16} /> Ganti Foto
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Input Nama & Email */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Nama Lengkap
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-200">
                <User size={18} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-800"
                  placeholder="Nama lengkap kamu"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-100">
                <Mail size={18} className="text-gray-400 mr-2" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="flex-1 bg-transparent outline-none text-gray-700 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Bagian Keamanan */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            🔒 Keamanan Akun
          </h2>

          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            Demi keamanan akun Anda, disarankan untuk memperbarui password
            secara berkala.
          </p>

          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-3"
          >
            <Lock size={18} />
            {showPasswordForm ? "Tutup Form Ganti Password" : "Ubah Password"}
          </button>

          <AnimatePresence>
            {showPasswordForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 border border-gray-200 bg-gray-50 rounded-xl shadow-sm"
              >
                <label className="text-sm text-gray-600">Password Baru</label>
                <div className="flex items-center mt-2 border rounded-lg px-3 py-2 bg-white">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    className="flex-1 bg-transparent outline-none text-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {passwordMsg && (
                  <p className="text-sm mt-2 text-center text-gray-600">
                    {passwordMsg}
                  </p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 shadow transition"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Simpan Password
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Tombol Simpan Profil */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleSaveProfile}
          disabled={loading}
          className="mt-10 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 shadow transition"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          Simpan Perubahan
        </motion.button>
      </div>
    </motion.div>
  );
}
