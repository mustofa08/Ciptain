import React from "react";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    console.log("📩 Signup attempt:", email);

    try {
      // Validasi sederhana
      if (!email || !password || password.length < 6) {
        setError("Email dan password wajib diisi (min. 6 karakter).");
        setLoading(false);
        return;
      }

      // 🔹 Proses signup (email verifikasi)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, phone }, // metadata disimpan di auth.users
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (signUpError) {
        console.error("❌ Signup error:", signUpError);
        setError(signUpError.message || "Pendaftaran gagal.");
        setLoading(false);
        return;
      }

      console.log("✅ Signup success:", data);

      // ✅ Notifikasi ke user
      setSuccess(
        "Pendaftaran berhasil 🎉 Silakan cek email kamu untuk verifikasi akun sebelum login."
      );
    } catch (err) {
      console.error("🔥 Unexpected signup error:", err);
      setError("Terjadi kesalahan tak terduga. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-xl shadow-lg w-96 transition-all"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Daftar ke <span className="text-blue-600">Ciptain</span>
        </h2>

        {/* ✅ Notifikasi sukses */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-4 text-sm text-center">
            {success}
          </div>
        )}

        {/* ❌ Notifikasi error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* 🧾 Input fields */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border w-full p-3 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        <input
          type="tel"
          placeholder="Nomor HP"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border w-full p-3 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border w-full p-3 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        <div className="relative mb-5">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border w-full p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* 🔘 Tombol daftar */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded text-white font-medium transition ${
            loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Mendaftar..." : "Sign Up"}
        </button>

        <div className="text-center mt-5 text-sm">
          <p className="text-gray-600">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-green-600 hover:underline">
              Login di sini
            </Link>
          </p>
          <p className="mt-2">
            <Link to="/" className="text-gray-500 hover:underline">
              ← Kembali ke Beranda
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
