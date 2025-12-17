import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  LogIn,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function NavbarDesktop() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <header className="hidden md:block bg-white/80 backdrop-blur-md border-b sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold text-blue-600">
          Ciptain<span className="text-gray-700"> Studio</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="flex items-center gap-1">
            <Home size={16} /> Home
          </Link>

          <Link to="/shop" className="flex items-center gap-1">
            <ShoppingBag size={16} /> Shop
          </Link>

          {!user && (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-1.5 border border-blue-600 rounded-full text-blue-600"
            >
              <LogIn size={16} /> Masuk
            </Link>
          )}

          {user && (
            <>
              <Link
                to={profile?.role === "admin" ? "/admin" : "/user"}
                className="flex items-center gap-2 px-4 py-1.5 border border-blue-600 rounded-full text-blue-600"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>

              <button
                onClick={logout}
                className="flex items-center gap-1 text-red-500"
              >
                <LogOut size={16} /> Keluar
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
