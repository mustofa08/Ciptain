import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ✅ Ambil data signup / login terakhir dari localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("last_email");
    const savedPassword = localStorage.getItem("last_password");

    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setPassword(savedPassword);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    // ✅ Simpan info login terakhir
    localStorage.setItem("last_email", email);
    localStorage.setItem("last_password", password);

    navigate("/");
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-96"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Login ke <span className="text-blue-600">Ciptain</span>
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
        )}

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border w-full p-3 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Password + toggle */}
        <div className="relative mb-5">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border w-full p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
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

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 rounded hover:bg-blue-700 transition"
        >
          Login
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
