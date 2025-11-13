// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Ambil session pertama kali saat aplikasi dijalankan
  useEffect(() => {
    const initSession = async () => {
      try {
        setLoading(true);

        // 🔸 Ambil session login dari Supabase
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) console.error("⚠️ Gagal mengambil session:", error);

        if (session?.user) {
          setUser(session.user);
          loadProfile(session.user.id); // 🚀 Non-blocking (tanpa await)
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("⚠️ Gagal memuat session:", err.message);
      } finally {
        // ✅ Jangan menunggu query profile selesai
        setLoading(false);
      }
    };

    initSession();

    // 🔁 Pantau perubahan login/logout Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🌀 Auth event:", event);

      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
    });

    // 🔚 Cleanup listener saat komponen unmount
    return () => subscription.unsubscribe();
  }, []);

  // 🔹 Fungsi untuk memuat data profile dari tabel `profiles`
  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle(); // ✅ aman meskipun data kosong

      if (error) {
        console.warn("⚠️ loadProfile error:", error.message);
        setProfile(null);
        return;
      }

      if (!data) {
        console.warn("⚠️ Tidak ditemukan data profil untuk user:", userId);
      }

      setProfile(data ?? null);
    } catch (err) {
      console.error("⚠️ Gagal memuat profil:", err.message);
      setProfile(null);
    }
  };

  // 🔹 Nilai context yang bisa diakses seluruh aplikasi
  const value = { user, profile, loading, setUser, setProfile };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen text-gray-500">
          Memuat sesi pengguna...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// 🔹 Hook custom biar mudah dipakai di seluruh komponen
export const useAuth = () => useContext(AuthContext);
