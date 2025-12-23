import React from "react";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";
import {
  Trash2,
  Search,
  RefreshCw,
  UserCog,
  Phone,
  Loader2,
} from "lucide-react";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // 🔹 Ambil semua data user dari tabel "profiles"
  // =====================================================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, email, phone, role, created_at")
        .order("created_at", { ascending: false, nullsFirst: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("❌ Gagal memuat pengguna:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // 🔹 useEffect — fetch & realtime listener
  // =====================================================
  useEffect(() => {
    fetchUsers();

    // Realtime listener untuk update otomatis
    const channel = supabase
      .channel("profiles-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        (payload) => {
          setUsers((prev) => {
            if (payload.eventType === "INSERT") {
              return [payload.new, ...prev];
            } else if (payload.eventType === "UPDATE") {
              return prev.map((u) =>
                u.id === payload.new.id ? payload.new : u
              );
            } else if (payload.eventType === "DELETE") {
              return prev.filter((u) => u.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // =====================================================
  // 🔹 Ubah role user
  // =====================================================
  const handleRoleChange = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";

    if (
      !window.confirm(
        `Ubah peran pengguna ini dari "${currentRole}" menjadi "${newRole}"?`
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", id);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("❌ Gagal mengubah peran:", err.message);
      alert("Gagal mengubah peran pengguna 😥");
    }
  };

  // =====================================================
  // 🔹 Hapus user
  // =====================================================
  const handleDelete = async (id, email) => {
    const confirmDelete = window.confirm(
      `Yakin ingin menghapus pengguna "${email}" secara permanen?`
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("❌ Gagal menghapus pengguna:", err.message);
      alert("Terjadi kesalahan saat menghapus pengguna 😥");
    }
  };

  // =====================================================
  // 🔹 Filter pencarian (case-insensitive)
  // =====================================================
  const filteredUsers = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.phone?.toLowerCase().includes(query)
    );
  }, [searchTerm, users]);

  // =====================================================
  // 🔹 UI
  // =====================================================
  return (
    <div className="p-6 md:p-10 bg-gradient-to-b from-blue-50 via-white to-blue-100 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
            👥 Kelola Pengguna
          </h1>
          <p className="text-gray-600 mt-1">
            Lihat, ubah peran, dan kelola semua pengguna di platform.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={fetchUsers}
          disabled={loading}
          className="w-full sm:w-auto mt-4 md:mt-0 px-4 py-2 
             bg-blue-600 hover:bg-blue-700 text-white 
             rounded-lg shadow-md transition 
             flex items-center justify-center gap-2"
        >
          <RefreshCw
            size={18}
            className={loading ? "animate-spin text-blue-100" : ""}
          />
          {loading ? "Memuat..." : "Refresh"}
        </motion.button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-8 w-full sm:max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Cari pengguna berdasarkan nama, email, atau nomor telepon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white/70 backdrop-blur-sm"
        />
      </div>

      {/* TABLE (Tablet & Desktop) */}
      <div className="hidden sm:block overflow-x-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100">
        {loading ? (
          <div className="flex justify-center py-16 text-gray-500">
            <Loader2 className="animate-spin mr-2" /> Memuat data pengguna...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-gray-500 italic">
            Tidak ada pengguna ditemukan 😅
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-blue-50 border-b">
              <tr className="text-gray-700">
                <th className="py-3 px-4 text-left font-semibold">Nama</th>
                <th className="py-3 px-4 text-left font-semibold">Email</th>
                <th className="py-3 px-4 text-left font-semibold">
                  No. Telepon
                </th>
                <th className="py-3 px-4 text-left font-semibold">Role</th>
                <th className="py-3 px-4 text-left font-semibold">
                  Tanggal Daftar
                </th>
                <th className="py-3 px-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b hover:bg-blue-50/40 transition"
                >
                  <td className="py-3 px-4 font-medium">
                    {u.username || "Tanpa Nama"}
                  </td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    {u.phone || "-"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(u.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-4">
                      <button onClick={() => handleRoleChange(u.id, u.role)}>
                        <UserCog size={18} className="text-blue-600" />
                      </button>
                      <button onClick={() => handleDelete(u.id, u.email)}>
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MOBILE CARD LIST */}
      <div className="sm:hidden space-y-4">
        {filteredUsers.map((u) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow border p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{u.username || "Tanpa Nama"}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  u.role === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {u.role}
              </span>
            </div>

            <div className="mt-3 text-sm space-y-1">
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                {u.phone || "-"}
              </p>
              <p className="text-xs text-gray-500">
                Daftar: {new Date(u.created_at).toLocaleDateString("id-ID")}
              </p>
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <button onClick={() => handleRoleChange(u.id, u.role)}>
                <UserCog size={18} className="text-blue-600" />
              </button>
              <button onClick={() => handleDelete(u.id, u.email)}>
                <Trash2 size={18} className="text-red-600" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
