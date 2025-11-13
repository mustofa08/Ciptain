// src/components/AuthRedirect.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AuthRedirect() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    // ✅ Redirect user login dari halaman public ke dashboard
    if (user && profile) {
      const current = location.pathname;
      if (["/", "/login", "/signup"].includes(current)) {
        navigate(profile.role === "admin" ? "/admin" : "/user", {
          replace: true,
        });
      }
    }
  }, [user, profile, loading, navigate, location.pathname]);

  return null;
}
