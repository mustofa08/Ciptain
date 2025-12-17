import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, ArrowLeftCircle } from "lucide-react";
import logoIcon from "../assets/logo-icon.svg";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 px-6 text-center overflow-hidden">
      {/* Logo */}
      <motion.img
        src={logoIcon}
        alt="Ciptain Logo"
        className="w-20 mb-6 drop-shadow-[0_0_25px_rgba(59,130,246,0.3)]"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* Error Code */}
      <motion.h1
        className="text-[8rem] md:text-[10rem] font-extrabold text-blue-600 drop-shadow-lg leading-none"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
      >
        404
      </motion.h1>

      {/* Message */}
      <motion.h2
        className="text-2xl md:text-3xl font-bold text-gray-800 mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Halaman Tidak Ditemukan 😢
      </motion.h2>

      <motion.p
        className="text-gray-600 mt-3 max-w-md text-base md:text-lg"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        Maaf, halaman yang kamu cari mungkin sudah dipindahkan atau tidak
        tersedia. Yuk kembali ke beranda dan lanjut berkreasi dengan{" "}
        <span className="text-blue-600 font-semibold">Ciptain</span> ✨
      </motion.p>

      {/* Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Link
          to="/"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Home size={20} /> Kembali ke Beranda
        </Link>
        <Link
          to={-1}
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-gray-50 hover:shadow-md transition-all duration-300"
        >
          <ArrowLeftCircle size={20} /> Halaman Sebelumnya
        </Link>
      </motion.div>

      {/* Decorative Glow */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-300/20 blur-[120px] rounded-full pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </div>
  );
}
