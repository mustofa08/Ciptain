import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Shop from "./pages/Shop";
import TemplateDetail from "./pages/TemplateDetail";
import Order from "./pages/Order";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {!hideNavbar && <Navbar />}{" "}
        {/* 👈 Navbar hanya tampil kalau bukan login/signup */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/template/:id" element={<TemplateDetail />} />
          <Route path="/order/:id" element={<Order />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
