// src/pages/user/Shop.jsx
import ShopCore from "../../components/ShopCore";
import { useAuth } from "../../contexts/AuthContext";

export default function Shop() {
  const { user, profile } = useAuth();
  const mode = profile?.role === "user" ? "user" : "public";
  return <ShopCore mode={mode} />;
}
