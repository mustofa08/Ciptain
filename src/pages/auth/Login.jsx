import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Ambil data tersimpan dari localStorage saat pertama kali render
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");
    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setPassword(savedPassword);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        setError("Email atau password salah.");
        setLoading(false);
        return;
      }

      // ✅ Simpan email & password ke localStorage
      localStorage.setItem("savedEmail", email);
      localStorage.setItem("savedPassword", password);

      // Ambil profil user dari tabel profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (!profile) {
        setError("Profil tidak ditemukan.");
        setLoading(false);
        return;
      }

      // ✅ Redirect berdasarkan role
      if (profile.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/"); // Dashboard (untuk user biasa)
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan, coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-96 transition-all"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Masuk ke <span className="text-blue-600">Ciptain</span>
        </h2>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border w-full p-3 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border w-full p-3 rounded mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded text-white font-medium transition flex justify-center items-center gap-2 ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Masuk..." : "Login"}
        </button>

        <div className="text-center mt-5 text-sm">
          <p className="text-gray-600">
            Belum punya akun?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Daftar di sini
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
