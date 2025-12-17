import React from "react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Bell,
  DollarSign,
  Package,
  Ban,
} from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const [loading, setLoading] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const soundRef = useRef(null);

  // =====================================================
  // 🔹 Fetch awal
  // =====================================================
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("❌ Gagal memuat orders:", error.message);
    else setOrders(data);
    setLoading(false);
  };

  // =====================================================
  // 🔹 Realtime listener (auto update order baru)
  // =====================================================
  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          console.log("🆕 Order baru masuk:", payload.new);
          setOrders((prev) => [payload.new, ...prev]);
          if (soundRef.current) soundRef.current.play();
          setNewOrderAlert({
            name: payload.new.customer_name,
            template: payload.new.template_name,
          });
          setTimeout(() => setNewOrderAlert(null), 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // =====================================================
  // 🔹 Update Status Order + Log perubahan status
  // =====================================================
  const handleStatusChange = async (id, newStatus) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;

    const oldStatus = order.status;

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("❌ Gagal update status:", error.message);
      return;
    }

    await supabase.from("order_logs").insert([
      {
        order_id: id,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: "Admin",
      },
    ]);

    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  // =====================================================
  // 💰 Hitung pendapatan (hanya order selesai)
  // =====================================================
  const totalRevenue = orders.reduce((sum, o) => {
    const price = parseInt(o.price.replace(/[^\d]/g, "")) || 0;
    if (o.status === "Selesai") return sum + price;
    return sum;
  }, 0);

  // =====================================================
  // 🔹 Filter data
  // =====================================================
  const filteredOrders =
    filter === "Semua" ? orders : orders.filter((o) => o.status === filter);

  // =====================================================
  // 📊 Statistik ringkas (berdasarkan status)
  // =====================================================
  const summary = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Menunggu Pembayaran").length,
    process: orders.filter((o) => o.status === "Diproses").length,
    success: orders.filter((o) => o.status === "Selesai").length,
    cancel: orders.filter((o) => o.status === "Dibatalkan").length,
  };

  // =====================================================
  // 🧱 UI
  // =====================================================
  return (
    <div className="p-8 relative">
      {/* 🔔 Suara notifikasi */}
      <audio
        ref={soundRef}
        src="https://cdn.pixabay.com/audio/2022/03/15/audio_6f1b17f38d.mp3"
        preload="auto"
      />

      {/* 🔥 Popup notifikasi visual */}
      <AnimatePresence>
        {newOrderAlert && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-5 right-5 bg-white border border-blue-200 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3 z-50"
          >
            <Bell className="text-blue-600" size={22} />
            <div>
              <p className="text-sm text-gray-700 font-medium">
                Order baru dari <b>{newOrderAlert.name}</b>
              </p>
              <p className="text-xs text-gray-500">
                Template: {newOrderAlert.template}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">📦 Kelola Order</h1>
          <p className="text-gray-600 mt-1">
            Pantau dan kelola semua pesanan pengguna di platform Ciptain 💼
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
        >
          <RefreshCw className={loading ? "animate-spin" : ""} size={18} />
          {loading ? "Memuat..." : "Refresh"}
        </motion.button>
      </div>

      {/* Pendapatan */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded-2xl p-5 shadow-lg flex justify-between items-center"
      >
        <div>
          <h2 className="text-lg font-semibold">Pendapatan Bersih</h2>
          <p className="text-2xl font-bold mt-1">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </p>
        </div>
        <DollarSign size={40} className="opacity-80" />
      </motion.div>

      {/* Statistik ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-10">
        <SummaryCard
          label="Total Order"
          value={summary.total}
          icon={Package}
          color="from-blue-500 to-blue-400"
        />
        <SummaryCard
          label="Menunggu Pembayaran"
          value={summary.pending}
          icon={DollarSign}
          color="from-yellow-400 to-yellow-300"
        />
        <SummaryCard
          label="Sedang Diproses"
          value={summary.process}
          icon={Clock}
          color="from-sky-500 to-sky-400"
        />
        <SummaryCard
          label="Selesai (Dibayar)"
          value={summary.success}
          icon={CheckCircle}
          color="from-green-500 to-green-400"
        />
        <SummaryCard
          label="Dibatalkan"
          value={summary.cancel}
          icon={Ban}
          color="from-red-500 to-rose-400"
        />
      </div>

      {/* Filter status */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        {[
          "Semua",
          "Menunggu Pembayaran",
          "Diproses",
          "Selesai",
          "Dibatalkan",
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === status
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Tabel Order */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-gray-700">
              <th className="py-3 px-4 text-left">Nama</th>
              <th className="py-3 px-4 text-left">Template</th>
              <th className="py-3 px-4 text-left">Harga</th>
              <th className="py-3 px-4 text-left">Metode</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-8 text-gray-500 italic"
                >
                  Tidak ada data untuk ditampilkan 😅
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b hover:bg-blue-50/50 transition"
                >
                  <td className="py-3 px-4">{o.customer_name}</td>
                  <td className="py-3 px-4">{o.template_name}</td>
                  <td className="py-3 px-4">{o.price}</td>
                  <td className="py-3 px-4">{o.payment_method}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <ActionButtons
                      id={o.id}
                      status={o.status}
                      handleStatusChange={handleStatusChange}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* 🔹 Komponen Status Badge */
function StatusBadge({ status }) {
  const statusMap = {
    "Menunggu Pembayaran": "bg-yellow-100 text-yellow-700",
    Diproses: "bg-sky-100 text-sky-700",
    Selesai: "bg-green-100 text-green-700",
    Dibatalkan: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
        statusMap[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

/* 🔹 Komponen Tombol Aksi */
function ActionButtons({ id, status, handleStatusChange }) {
  const confirmAndChange = (newStatus) => {
    const message = `Yakin ingin ubah status order menjadi "${newStatus}"?`;
    if (window.confirm(message)) handleStatusChange(id, newStatus);
  };

  const buttons = [
    {
      status: "Menunggu Pembayaran",
      color: "text-yellow-600",
      icon: DollarSign,
    },
    { status: "Diproses", color: "text-sky-600", icon: Clock },
    { status: "Selesai", color: "text-green-600", icon: CheckCircle },
    { status: "Dibatalkan", color: "text-red-600", icon: XCircle },
  ];

  return (
    <div className="flex justify-center gap-2 flex-wrap">
      {buttons
        .filter((b) => b.status !== status)
        .map((b, i) => {
          const Icon = b.icon;
          return (
            <button
              key={i}
              onClick={() => confirmAndChange(b.status)}
              className={`${b.color} hover:opacity-80`}
              title={`Ubah ke ${b.status}`}
            >
              <Icon size={18} />
            </button>
          );
        })}
    </div>
  );
}

/* 🔹 Komponen Kartu Ringkasan */
function SummaryCard({ label, value, icon: Icon, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`bg-gradient-to-r ${color} text-white rounded-2xl p-5 shadow-lg flex justify-between items-center`}
    >
      <div>
        <p className="text-sm opacity-80">{label}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className="bg-white/20 p-2 rounded-full">
        <Icon size={24} />
      </div>
    </motion.div>
  );
}
