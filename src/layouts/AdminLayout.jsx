import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  ClipboardList,
  Home,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

export default function AdminLayout() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Orders", path: "/admin/orders", icon: ClipboardList },
    { name: "Templates", path: "/admin/templates", icon: FileText },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* ================= SIDEBAR (DESKTOP) ================= */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-white border-r shadow-md flex-col">
        <div className="flex-1">
          {/* Brand */}
          <div className="p-6 border-b border-gray-200">
            <Link to="/admin">
              <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">
                Ciptain<span className="text-gray-800"> Admin</span>
              </h1>
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              👋 {profile?.username || "Administrator"}
            </p>
          </div>

          {/* Menu */}
          <nav className="mt-4 px-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <motion.div key={item.name} whileHover={{ scale: 1.03 }}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-100 text-blue-700 shadow-sm"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t">
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg py-2.5 font-semibold"
          >
            <LogOut size={18} />
            Keluar
          </motion.button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* ================= BOTTOM NAVBAR (MOBILE) ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
        <div className="flex justify-around items-center h-16">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 text-xs transition ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-blue-500"
                }`}
              >
                <Icon size={22} />
                <span className="text-[11px]">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
