import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { BarChart3, Users, FileText, Wallet, UserCog } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    admins: 0,
    templates: 0,
    orders: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ count: userCount }, { count: adminCount }] = await Promise.all(
          [
            supabase
              .from("profiles")
              .select("*", { count: "exact", head: true })
              .eq("role", "user"),
            supabase
              .from("profiles")
              .select("*", { count: "exact", head: true })
              .eq("role", "admin"),
          ]
        );

        const [
          { count: templateCount },
          { data: orderData, error: orderError },
        ] = await Promise.all([
          supabase
            .from("templates")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

        if (orderError) throw orderError;

        const totalRevenue =
          orderData?.reduce((acc, order) => {
            const num = parseInt(order.price.replace(/[^\d]/g, "")) || 0;
            return order.status === "Selesai" ? acc + num : acc;
          }, 0) || 0;

        setStats({
          users: userCount || 0,
          admins: adminCount || 0,
          templates: templateCount || 0,
          orders: orderData?.length || 0,
          revenue: totalRevenue,
        });

        setRecentOrders(orderData || []);
      } catch (err) {
        console.error("❌ Gagal memuat data dashboard:", err.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8 md:p-10 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-2 flex items-center justify-center md:justify-start gap-2">
          👑 Admin Dashboard
        </h1>
        <p className="text-gray-600 text-base md:text-lg">
          Pantau pengguna, template, dan transaksi di platform <b>Ciptain</b> 💼
        </p>
      </div>

      {/* Statistik Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <StatCard
          icon={Users}
          title="Total Pengguna"
          value={stats.users}
          color="from-blue-500 to-blue-400"
        />
        <StatCard
          icon={UserCog}
          title="Total Admin"
          value={stats.admins}
          color="from-indigo-500 to-indigo-400"
        />
        <StatCard
          icon={FileText}
          title="Total Template"
          value={stats.templates}
          color="from-green-500 to-green-400"
        />
        <StatCard
          icon={BarChart3}
          title="Total Order"
          value={stats.orders}
          color="from-purple-500 to-purple-400"
        />
        <StatCard
          icon={Wallet}
          title="Pendapatan"
          value={`Rp ${stats.revenue.toLocaleString("id-ID")}`}
          color="from-yellow-500 to-orange-400"
        />
      </section>

      {/* Order Terbaru */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-gray-200 rounded-3xl shadow-md p-6 md:p-8"
      >
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          📦 Order Terbaru
        </h2>

        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-base">
            Belum ada order yang masuk 😅
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-700 font-semibold">
                  <th className="px-5 py-3">Nama</th>
                  <th className="px-5 py-3">Template</th>
                  <th className="px-5 py-3">Harga</th>
                  <th className="px-5 py-3">Metode</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr
                    key={order.id || index}
                    className="border-t border-gray-100 hover:bg-blue-50/40 transition"
                  >
                    <td className="px-5 py-3">{order.customer_name}</td>
                    <td className="px-5 py-3">{order.template_name}</td>
                    <td className="px-5 py-3">{order.price}</td>
                    <td className="px-5 py-3">{order.payment_method}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.section>
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
      className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium ${
        statusMap[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

/* 🔹 Komponen Kartu Statistik */
function StatCard({ icon: Icon, title, value, color, subtitle }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`bg-gradient-to-r ${color} text-white rounded-2xl shadow-lg px-5 py-5 flex flex-col justify-between h-[130px]`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-90 font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="bg-white/25 p-2.5 rounded-full">
          <Icon size={22} />
        </div>
      </div>
      {subtitle ? (
        <p className="text-xs mt-2 opacity-90 italic">{subtitle}</p>
      ) : (
        <div className="h-3" />
      )}
    </motion.div>
  );
}
