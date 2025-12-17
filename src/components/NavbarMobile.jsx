import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, ShoppingBag, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function NavbarMobile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = profile?.role === "admin" ? "/admin" : "/user";

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg">
      <div className="flex justify-around items-center py-2">
        <NavItem to="/" icon={<Home />} />
        <NavItem to="/shop" icon={<ShoppingBag />} />

        {/* Dashboard / Login */}
        <NavItem to={user ? dashboardPath : "/login"} icon={<User />} />

        {/* Logout (only when logged in) */}
        {user && (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-1 text-xs text-red-400 hover:text-red-600 transition"
          >
            <LogOut className="w-6 h-6" />
          </button>
        )}
      </div>
    </nav>
  );
}

function NavItem({ to, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-1 text-xs ${
          isActive ? "text-blue-600" : "text-gray-400"
        }`
      }
    >
      <div className="w-6 h-6">{icon}</div>
    </NavLink>
  );
}
