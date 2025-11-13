// src/lib/helpers.js
import { supabase } from "./supabaseClient";

// ✅ Format harga ke Rupiah
export const formatRupiah = (val) => {
  if (!val) return "Rp 0";
  const num = parseInt(val.toString().replace(/[^\d]/g, "")) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(num);
};

// ✅ Ambil public URL dari storage Supabase
export const getPublicUrl = (bucket, path) => {
  if (!path) return "/src/assets/template-placeholder.jpg";
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || "/src/assets/template-placeholder.jpg";
};
