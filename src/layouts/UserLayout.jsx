// ✅ src/layouts/UserLayout.jsx
import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { Home, ShoppingBag, ChevronDown, LogOut, User } from "lucide-react";

export default function UserLayout() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100">
      {/* 🌟 Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/user"
            className="text-2xl font-extrabold text-blue-600 tracking-tight hover:text-blue-700 transition"
          >
            Ciptain<span className="text-gray-700"> Studio</span>
          </Link>

          {/* Menu */}
          <nav className="flex items-center gap-6">
            <Link
              to="/user"
              className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition font-medium"
            >
              <Home size={18} /> Dashboard
            </Link>
            <Link
              to="/user/shop"
              className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition font-medium"
            >
              <ShoppingBag size={18} /> Shop
            </Link>

            {/* 🔹 Dropdown Avatar */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5 transition"
              >
                <img
                  src={
                    profile?.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
                  }
                  alt={profile?.username || "Avatar"}
                  className="w-8 h-8 rounded-full border object-cover"
                />
                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform ${
                    dropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden animate-fadeIn z-50">
                  <div className="px-4 py-3 border-b bg-gray-50">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {profile?.username || "Pengguna"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    to="/user/profile"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 text-sm transition"
                  >
                    <User size={16} /> Profil Saya
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 text-sm transition"
                  >
                    <LogOut size={16} /> Keluar
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* 🌈 Main Content */}
      <main className="flex-1 animate-fadeIn">
        <Outlet />
      </main>

      {/* 🩵 Footer */}
      <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} <b>Ciptain</b> — Menciptakan Kesan Digital
        yang Abadi 💙
      </footer>
    </div>
  );
}
