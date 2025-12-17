import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth();

  // ⏳ Tunggu hingga user dan profile selesai dimuat
  if (loading || (user && !profile)) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Memeriksa akun...
      </div>
    );
  }

  // ❌ Belum login
  if (!user) return <Navigate to="/login" replace />;

  // ❌ Role tidak sesuai (misal role=admin tapi user.role=user)
  if (role && profile?.role !== role) {
    const redirectPath =
      profile?.role === "admin"
        ? "/admin"
        : profile?.role === "user"
        ? "/user"
        : "/";
    return <Navigate to={redirectPath} replace />;
  }

  // ✅ Role sesuai atau tidak ada role spesifik
  return children;
}
