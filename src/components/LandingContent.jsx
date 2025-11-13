// ✅ src/components/LandingContent.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // 👈 tambahkan ini
import {
  ShoppingBag,
  Palette,
  Sparkles,
  Share2,
  ShieldCheck,
  Clock,
  Wand2,
  Globe,
  CloudUpload,
  Smartphone,
  Zap,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Instagram } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { FaWhatsapp } from "react-icons/fa";
import logoIcon from "../assets/logo-icon.svg";
import { useState, useEffect } from "react";

const floatingImages = [
  {
    src: "/src/assets/sample1.jpg",
    style: { top: "0%", left: "10%" },
    delay: 1,
    size: "w-32 md:w-40",
    duration: 6,
  },
  {
    src: "/src/assets/sample2.jpg",
    style: { top: "0%", right: "10%" },
    delay: 2,
    size: "w-32 md:w-40",
    duration: 7,
  },
  {
    src: "/src/assets/sample3.jpg",
    style: { bottom: "0%", left: "0%" },
    delay: 3,
    size: "w-28 md:w-36",
    duration: 5,
  },
  {
    src: "/src/assets/sample4.jpg",
    style: { bottom: "0%", right: "0%" },
    delay: 4,
    size: "w-28 md:w-36",
    duration: 6,
  },
];

export default function LandingContent({ mode = "public" }) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { profile, user } = useAuth(); // 👈 ambil data user dari context

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const userName =
    profile?.username ||
    profile?.display_name ||
    user?.email?.split("@")[0] ||
    "Pengguna"; // fallback

  return (
    <div className="flex flex-col items-center bg-gradient-to-b from-blue-50 via-white to-blue-100 min-h-screen overflow-hidden">
      {/* HERO */}
      <section className="flex flex-col md:flex-row justify-between items-center w-full max-w-7xl px-10 py-24 relative">
        <motion.div
          className="md:w-1/2 text-center md:text-left flex flex-col items-center md:items-start z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={logoIcon}
            alt="Ciptain Logo"
            className="w-20 mb-6 drop-shadow-[0_0_25px_rgba(59,130,246,0.5)] animate-pulse"
          />
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
            {mode === "user"
              ? `👋 Selamat Datang, ${userName}!`
              : "Ciptain — Platform Kreatif Digital"}
          </h1>
          <p className="text-gray-600 text-lg mb-10 max-w-md leading-relaxed">
            Wujudkan undangan pernikahan dan portofolio digital impianmu dengan
            desain elegan, interaktif, dan mudah dibagikan.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Link
              to={mode === "user" ? "/user/shop" : "/shop"}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              Mulai Ciptakan Karyamu 🚀
            </Link>
            <div className="flex items-center gap-5 text-gray-600">
              <a
                href="https://www.instagram.com/ciptain_studio/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-pink-500 transition"
              >
                <Instagram size={26} />
              </a>
              <a
                href="https://www.tiktok.com/@ciptain_studio"
                target="_blank"
                rel="noreferrer"
                className="hover:text-black transition"
              >
                <SiTiktok size={24} />
              </a>
              <a
                href="https://wa.me/6281515434168"
                target="_blank"
                rel="noreferrer"
                className="hover:text-green-500 transition"
              >
                <FaWhatsapp size={26} />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Floating images */}
        <div className="md:w-1/2 mt-14 md:mt-0 relative flex justify-center items-center">
          <motion.div
            className="absolute inset-0 blur-[150px] opacity-60 bg-gradient-to-br from-blue-400/50 via-cyan-300/40 to-transparent rounded-full"
            animate={{ opacity: [0.3, 0.7, 0.4], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <div className="relative w-full max-w-md h-[420px]">
            {floatingImages.map((img, i) => (
              <motion.img
                key={i}
                src={img.src}
                alt=""
                className={`absolute rounded-2xl shadow-2xl ${img.size}`}
                animate={{
                  y: [0, -20, 0, 15, 0],
                  x: [0, 10, 0, -10, 0],
                  rotate: [0, 1.5, -1.5, 0],
                }}
                transition={{
                  duration: img.duration + 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: img.delay,
                }}
                style={img.style}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 💎 KEUNGGULAN */}
      <section className="relative w-full bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white py-24 px-6 text-center">
        <motion.h2
          className="text-4xl font-extrabold mb-12 drop-shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          💎 Kenapa Harus <span className="text-yellow-300">Ciptain?</span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {[
            {
              icon: <ShieldCheck size={42} />,
              title: "Desain Premium",
              desc: "Template eksklusif, modern, dan selalu mengikuti tren terkini.",
            },
            {
              icon: <Clock size={42} />,
              title: "Cepat & Mudah",
              desc: "Tanpa coding! Semua bisa kamu sesuaikan hanya dengan beberapa klik.",
            },
            {
              icon: <Wand2 size={42} />,
              title: "Kustomisasi Bebas",
              desc: "Ganti warna, font, dan layout sesuai gaya & karaktermu.",
            },
            {
              icon: <Globe size={42} />,
              title: "Online & Siap Pakai",
              desc: "Karya langsung bisa diakses dari seluruh dunia dalam hitungan detik.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="bg-white/10 rounded-3xl p-8 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="mb-4 text-yellow-300">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ⚙️ FITUR UNGGULAN */}
      <section className="w-full max-w-6xl px-6 py-24 text-center">
        <motion.h2
          className="text-4xl font-bold text-gray-800 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          ⚙️ Fitur Unggulan <span className="text-blue-600">Ciptain</span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              icon: <CloudUpload size={38} />,
              title: "Penyimpanan Cloud",
              desc: "Semua proyekmu disimpan aman dan bisa diakses kapan saja.",
            },
            {
              icon: <Smartphone size={38} />,
              title: "Desain Responsif",
              desc: "Tampilan sempurna di HP, tablet, hingga layar besar.",
            },
            {
              icon: <Zap size={38} />,
              title: "Performa Super Cepat",
              desc: "Website dimuat secepat kilat berkat optimasi modern.",
            },
          ].map((fitur, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="text-blue-600 mb-5">{fitur.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {fitur.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {fitur.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ✨ CARA ORDER */}
      <section className="w-full max-w-6xl px-6 py-24 text-center bg-gradient-to-b from-white to-blue-50 rounded-t-[4rem] shadow-inner mx-auto">
        <motion.h2
          className="text-4xl font-bold text-gray-800 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          ✨ Cara Order di <span className="text-blue-600">Ciptain</span>
        </motion.h2>

        <div className="relative flex flex-col lg:flex-row justify-between items-center gap-10">
          {[
            {
              icon: <ShoppingBag size={40} />,
              title: "1. Pilih Template",
              desc: "Telusuri berbagai desain undangan & portofolio favoritmu.",
              color: "from-blue-400 to-blue-600",
            },
            {
              icon: <Palette size={40} />,
              title: "2. Sesuaikan Desain",
              desc: "Ubah teks, warna, dan foto sesuai kebutuhanmu.",
              color: "from-pink-400 to-pink-600",
            },
            {
              icon: <Sparkles size={40} />,
              title: "3. Lakukan Pembayaran",
              desc: "Gunakan metode pembayaran yang mudah & cepat.",
              color: "from-yellow-400 to-yellow-600",
            },
            {
              icon: <Share2 size={40} />,
              title: "4. Publikasikan & Bagikan",
              desc: "Karyamu siap dibagikan ke seluruh dunia 🌍",
              color: "from-green-400 to-green-600",
            },
          ].map((step, i, arr) => (
            <motion.div
              key={i}
              className="relative flex flex-col items-center lg:w-1/4"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              {/* Icon bulat gradient */}
              <div
                className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg mb-5`}
              >
                {step.icon}
              </div>

              {/* Text */}
              <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Panah antar step (hanya selain terakhir) */}
              {i < arr.length - 1 && (
                <div className="hidden lg:block absolute top-10 right-[-50px]">
                  <svg
                    width="100"
                    height="50"
                    viewBox="0 0 100 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-blue-400 opacity-60"
                  >
                    <path
                      d="M0 25H90M90 25L80 15M90 25L80 35"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Garis penghubung di bawah (mobile view) */}
        <div className="lg:hidden mt-10 flex flex-col items-center gap-2 text-blue-400">
          <ArrowDown size={24} />
          <div className="w-1 h-12 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
          <ArrowDown size={24} />
          <div className="w-1 h-12 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
          <ArrowDown size={24} />
        </div>
      </section>

      {showScrollTop && (
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </div>
  );
}
