// ✅ src/layouts/AdminLayout.jsx
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  ClipboardList,
  Eye,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { usePreview } from "../contexts/PreviewContext";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import { useState } from "react";

export default function AdminLayout() {
  const { profile } = useAuth();
  const { previewMode, setPreviewMode } = usePreview();
  const [showMenu, setShowMenu] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Templates", path: "/admin/templates", icon: FileText },
    { name: "Orders", path: "/admin/orders", icon: ClipboardList },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <aside className="w-64 md:w-72 bg-white border-r shadow-md flex flex-col justify-between transition-all">
        <div>
          <div className="p-6 border-b border-gray-200">
            <Link to="/admin" className="block">
              <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">
                Ciptain<span className="text-gray-800"> Admin</span>
              </h1>
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              👋 {profile?.username || "Administrator"}
            </p>
          </div>

          {/* 🔵 PREVIEW BUTTON */}
          <div className="px-4 py-3 border-b">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-full flex items-center justify-between bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <Eye size={16} /> Preview Mode
              </span>
              <span className="text-xs opacity-70">{previewMode}</span>
            </button>

            {showMenu && (
              <div className="mt-2 bg-white shadow-md rounded-lg text-sm overflow-hidden">
                <button
                  onClick={() => setPreviewMode("public")}
                  className="w-full px-4 py-2 hover:bg-gray-100 text-left"
                >
                  👥 Lihat sebagai Pengunjung
                </button>

                <button
                  onClick={() => setPreviewMode("user")}
                  className="w-full px-4 py-2 hover:bg-gray-100 text-left"
                >
                  👤 Lihat sebagai User
                </button>

                <button
                  onClick={() => setPreviewMode("mobile")}
                  className="w-full px-4 py-2 hover:bg-gray-100 text-left"
                >
                  📱 Preview Mobile
                </button>

                <button
                  onClick={() => setPreviewMode("desktop")}
                  className="w-full px-4 py-2 hover:bg-gray-100 text-left"
                >
                  🖥️ Preview Desktop
                </button>

                <button
                  onClick={() => setPreviewMode("none")}
                  className="w-full px-4 py-2 hover:bg-gray-100 text-left text-red-600"
                >
                  ❌ Matikan Preview
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="mt-4 px-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 250 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
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

        {/* Logout Button */}
        <div className="p-5 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg py-2.5 font-semibold transition-all"
          >
            <LogOut size={18} />
            Keluar
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
