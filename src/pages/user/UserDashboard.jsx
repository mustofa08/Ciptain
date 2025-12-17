import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart, ClipboardList, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function UserDashboard() {
  const { user, profile } = useAuth();

  const name = profile?.username || user?.email?.split("@")[0] || "Pengguna";

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800">
          👋 Halo, {name}
        </h1>
        <p className="text-gray-500 mt-1">Selamat datang di dashboard akunmu</p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<ClipboardList />} title="Total Order" value="0" />
        <StatCard icon={<Heart />} title="Favorit" value="0" />
        <StatCard icon={<ShoppingBag />} title="Template Dibeli" value="0" />
      </div>

      {/* ================= QUICK ACTION ================= */}
      <div className="bg-white rounded-2xl shadow border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Aksi Cepat</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickLink to="/shop" icon={<ShoppingBag />} label="Jelajahi Shop" />
          <QuickLink
            to="/user/orders"
            icon={<ClipboardList />}
            label="Order Saya"
          />
          <QuickLink to="/user/profile" icon={<User />} label="Profil Akun" />
        </div>
      </div>

      {/* ================= EMPTY STATE ================= */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
        <p className="text-gray-600">Kamu belum memiliki order.</p>
        <Link
          to="/shop"
          className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-full"
        >
          Mulai Pilih Template
        </Link>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow border p-6 flex items-center gap-4">
      <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function QuickLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-4 border rounded-xl hover:bg-blue-50 transition"
    >
      <div className="text-blue-600">{icon}</div>
      <span className="font-medium text-gray-700">{label}</span>
    </Link>
  );
}
