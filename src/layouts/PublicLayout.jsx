// ✅ src/layouts/PublicLayout.jsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logoIcon from "../assets/logo-icon.svg";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ShoppingBag, LogIn, LayoutDashboard } from "lucide-react";

export default function PublicLayout({ children }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // 🔹 Tutup menu jika klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-800">
      {/* 🌟 Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          {/* 🔹 Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-extrabold text-blue-600 tracking-tight hover:text-blue-700 transition"
          >
            <motion.img
              src={logoIcon}
              alt="Ciptain Logo"
              className="w-8 h-8"
              initial={{ rotate: -10, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            Ciptain<span className="text-gray-700"> Studio</span>
          </Link>

          {/* 🔹 Navigation Menu */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <NavLink to="/" label="Beranda" icon={<Home size={16} />} />
            <NavLink to="/shop" label="Shop" icon={<ShoppingBag size={16} />} />

            {user ? (
              <Link
                to={profile?.role === "admin" ? "/admin" : "/user"}
                className="flex items-center gap-2 px-4 py-1.5 border border-blue-600 rounded-full text-blue-600 hover:bg-blue-600 hover:text-white font-semibold transition"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-1.5 border border-blue-600 rounded-full text-blue-600 hover:bg-blue-600 hover:text-white font-semibold transition"
              >
                <LogIn size={16} /> Masuk
              </Link>
            )}
          </nav>

          {/* 🔸 Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
          >
            ☰
          </button>
        </div>

        {/* 🔹 Mobile Dropdown Menu */}
        {menuOpen && (
          <div
            ref={menuRef}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fadeIn"
          >
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
            >
              <Home size={16} className="inline mr-2" />
              Beranda
            </Link>
            <Link
              to="/shop"
              onClick={() => setMenuOpen(false)}
              className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
            >
              <ShoppingBag size={16} className="inline mr-2" />
              Shop
            </Link>

            {user ? (
              <Link
                to={profile?.role === "admin" ? "/admin" : "/user"}
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-3 text-blue-600 font-semibold hover:bg-blue-100 transition"
              >
                <LayoutDashboard size={16} className="inline mr-2" />
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-3 text-blue-600 font-semibold hover:bg-blue-100 transition"
              >
                <LogIn size={16} className="inline mr-2" />
                Masuk
              </Link>
            )}
          </div>
        )}
      </header>

      {/* 🔹 Komponen tambahan (AuthRedirect dll) */}
      {children}

      {/* 🌈 Main Content */}
      <main className="flex-1 animate-fadeIn">
        <Outlet />
      </main>

      {/* 🌟 Footer */}
      <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm mt-auto">
        © {new Date().getFullYear()} <b>Ciptain</b> — Menciptakan Kesan Digital
        yang Abadi 💙
      </footer>
    </div>
  );
}

/* 🔸 Komponen kecil untuk link navigasi agar konsisten */
function NavLink({ to, label, icon }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition font-medium"
    >
      {icon}
      {label}
    </Link>
  );
}
