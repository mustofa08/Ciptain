import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import logoIcon from "../assets/logo-full-r.svg";

export default function Navbar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const authRef = useRef(null);
  const location = useLocation();

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        authRef.current &&
        !authRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
        setAuthMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      if (user && user.email) {
        localStorage.setItem("last_email", user.email);
      }
      setMenuOpen(false);
      console.log("✅ User logged out (tetap di halaman beranda).");
    } catch (error) {
      console.error("Logout gagal:", error.message);
    }
  }

  const profileInitial =
    user?.user_metadata?.username?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase();

  return (
    <nav className="flex justify-between items-center px-10 bg-white shadow-md h-16 relative">
      {/* 🔹 Logo */}
      <Link to="/" className="flex items-center gap-3">
        <img
          src={logoIcon}
          alt="Ciptain logo"
          className="w-32 h-auto object-contain transition-transform duration-300 hover:scale-105 drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]"
        />
      </Link>

      {/* 🔹 Menu Utama */}
      <div className="flex items-center gap-8 font-medium">
        {/* Navigasi */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`transition hover:text-blue-600 ${
              location.pathname === "/"
                ? "text-blue-600 font-semibold"
                : "text-gray-700"
            }`}
          >
            Beranda
          </Link>
          <Link
            to="/shop"
            className={`transition hover:text-blue-600 ${
              location.pathname === "/shop"
                ? "text-blue-600 font-semibold"
                : "text-gray-700"
            }`}
          >
            Shop
          </Link>
        </div>

        {/* 🔸 Login / Profile */}
        {!user ? (
          <div className="relative" ref={authRef}>
            {/* Tombol utama gabungan */}
            <button
              onClick={() => setAuthMenuOpen(!authMenuOpen)}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-5 py-2 rounded-full font-medium text-sm shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <span>Login / Sign Up</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 transition-transform ${
                  authMenuOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Login & Signup */}
            {authMenuOpen && (
              <div className="absolute right-0 mt-3 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fadeIn z-50">
                <Link
                  to="/login"
                  onClick={() => setAuthMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 text-sm transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setAuthMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 text-sm transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        ) : (
          // 🔹 Dropdown Profile
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg hover:brightness-110 transition"
            >
              {profileInitial}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fadeIn z-50">
                <div className="px-4 py-2 border-b border-gray-100 text-sm text-gray-600">
                  <p className="font-medium">
                    {user.user_metadata?.username || user.email.split("@")[0]}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
