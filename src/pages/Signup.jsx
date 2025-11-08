import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handleSignup(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // ✅ Simpan sementara ke localStorage agar bisa auto-fill di halaman login
    localStorage.setItem("signup_email", email);
    localStorage.setItem("signup_password", password);

    // ✅ Cek apakah email sudah digunakan
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      setError("Email sudah digunakan. Silakan login atau gunakan email lain.");
      return;
    }

    // ✅ Buat akun baru + kirim email verifikasi
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, phone },
        emailRedirectTo: `${window.location.origin}/login`, // setelah verifikasi -> ke login
      },
    });

    if (signUpError) {
      if (signUpError.message.includes("User already registered")) {
        setError(
          "Email sudah terdaftar. Silakan login atau gunakan email lain."
        );
      } else {
        setError(signUpError.message);
      }
      return;
    }

    // ✅ Simpan profil (opsional)
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        username,
        phone,
        email,
      });
    }

    // ✅ Tampilkan pesan sukses
    setSuccess(
      "Pendaftaran berhasil! Silakan cek email kamu untuk verifikasi sebelum login."
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-xl shadow-lg w-96"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Daftar ke <span className="text-blue-600">Ciptain</span>
        </h2>

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm text-center">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

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

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2.5 rounded hover:bg-green-700 transition"
        >
          Sign Up
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
