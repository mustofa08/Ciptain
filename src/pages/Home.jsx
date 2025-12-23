import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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
import sample1 from "../assets/sample1.png";
import sample2 from "../assets/sample2.png";
import sample3 from "../assets/sample1.png";
import sample4 from "../assets/sample2.png";

/* ================= Marquee IMAGES ================= */
const marqueeImages = [sample1, sample2, sample3, sample4];

export default function Home() {
  const { user, profile } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const userName =
    profile?.username ||
    profile?.display_name ||
    user?.email?.split("@")[0] ||
    "Pengunjung";

  return (
    <div className="flex flex-col items-center bg-gradient-to-b from-blue-50 via-white to-blue-100 min-h-screen overflow-x-hidden">
      {/* ================= HERO ================= */}
      <section className="flex flex-col md:flex-row justify-between items-center w-full max-w-7xl px-4 sm:px-6 md:px-10 py-16 sm:py-20 md:py-24 relative">
        <motion.div
          className="md:w-1/2 text-center md:text-left flex flex-col items-center md:items-start z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={logoIcon}
            alt="Ciptain Logo"
            className="w-16 sm:w-20 mb-6 drop-shadow-[0_0_25px_rgba(59,130,246,0.5)] animate-pulse"
          />

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            {user
              ? `👋 Selamat Datang, ${userName}!`
              : "Ciptain — Platform Kreatif Digital"}
          </h1>

          <p className="text-gray-600 text-base sm:text-lg mb-8 sm:mb-10 max-w-md leading-relaxed">
            Wujudkan undangan pernikahan dan portofolio digital impianmu dengan
            desain elegan, interaktif, dan mudah dibagikan.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full sm:w-auto">
            <Link
              to="/shop"
              className="w-full sm:w-auto justify-center bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-6 sm:px-8 py-3 rounded-full text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2"
            >
              <ShoppingBag size={20} />
              Jelajahi Template
            </Link>

            <div className="flex items-center gap-5 text-gray-600">
              <a
                href="https://www.instagram.com/ciptain_studio/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-pink-500 transition"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://www.tiktok.com/@ciptain_studio"
                target="_blank"
                rel="noreferrer"
                className="hover:text-black transition"
              >
                <SiTiktok size={22} />
              </a>
              <a
                href="https://wa.me/6281515434168"
                target="_blank"
                rel="noreferrer"
                className="hover:text-green-500 transition"
              >
                <FaWhatsapp size={24} />
              </a>
            </div>
          </div>
        </motion.div>

        {/* ================= MARQUEE IMAGES ================= */}
        <div className="relative w-full md:w-1/2 mt-12 md:mt-0 overflow-hidden">
          {/* fade kiri */}
          <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-blue-50 to-transparent z-10" />
          {/* fade kanan */}
          <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-blue-50 to-transparent z-10" />

          <motion.div
            className="flex gap-6 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 20,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {[...marqueeImages, ...marqueeImages].map((img, i) => (
              <div
                key={i}
                className="
          flex-shrink-0
          w-40 sm:w-48 md:w-56
          h-56 sm:h-64 md:h-72
          bg-white
          rounded-3xl
          shadow-xl
          overflow-hidden
        "
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= KEUNGGULAN ================= */}
      <section className="relative w-full bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white py-16 sm:py-20 md:py-24 px-4 sm:px-6 text-center">
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-10 sm:mb-12 drop-shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          💎 Kenapa Harus <span className="text-yellow-300">Ciptain?</span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 max-w-6xl mx-auto">
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
              className="bg-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
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

      {/* ================= FITUR ================= */}
      <section className="w-full max-w-6xl px-4 sm:px-6 py-16 sm:py-20 md:py-24 text-center">
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          ⚙️ Fitur Unggulan <span className="text-blue-600">Ciptain</span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
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
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
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

      {/* ================= CARA ORDER ================= */}
      <section className="w-full max-w-6xl px-4 sm:px-6 py-16 sm:py-20 md:py-24 text-center bg-gradient-to-b from-blue-700 via-blue-600 to-cyan-500 rounded-t-[4rem] shadow-inner mx-auto">
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          ✨ Cara Order di <span className="text-yellow-300">Ciptain</span>
        </motion.h2>

        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-10">
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
            <React.Fragment key={i}>
              {/* STEP CARD */}
              <motion.div
                className="relative flex flex-col items-center w-full sm:max-w-md lg:max-w-xs"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                {/*DESKTOP ARROW */}
                <div className="relative flex flex-col items-center w-full sm:max-w-md lg:max-w-xs">
                  <div className="mb-5 flex items-center justify-center">
                    <div
                      className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}
                    >
                      {step.icon}
                    </div>
                  </div>

                  {/* DESKTOP ARROW → */}
                  {i < arr.length - 1 && (
                    <div
                      className="
                      hidden lg:flex
                      absolute
                      right-[-56px]
                      top-1/2
                      -translate-y-1/2
                      text-yellow-500
                    "
                    >
                      <svg
                        width="40"
                        height="20"
                        viewBox="0 0 40 20"
                        fill="none"
                      >
                        <path
                          d="M0 10H32M32 10L24 2M32 10L24 18"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* TEXT CARD */}
                <div
                  className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 
                text-center w-full min-h-[170px] 
                flex flex-col justify-center"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>

              {/* MOBILE ARROW ↓ */}
              {i < arr.length - 1 && (
                <div className="lg:hidden my-6 flex flex-col items-center text-yellow-500">
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ArrowDown size={60} />
                  </motion.div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {showScrollTop && (
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 sm:bottom-8 right-4 sm:right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </div>
  );
}
