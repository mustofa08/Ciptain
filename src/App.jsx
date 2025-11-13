import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect"; // 👈 Tambahkan ini

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

// Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageTemplates from "./pages/admin/ManageTemplates";
import AdminOrders from "./pages/admin/AdminOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import Settings from "./pages/admin/Settings";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Shop from "./pages/user/Shop";
import Order from "./pages/user/Order";
import NotFound from "./pages/NotFound";
import LandingContent from "./components/LandingContent";

function App() {
  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        <Routes>
          {/* 🌐 PUBLIC */}
          <Route
            element={
              <PublicLayout>
                <AuthRedirect />
              </PublicLayout>
            }
          >
            <Route path="/" element={<LandingContent mode="public" />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* 👤 USER */}
          <Route
            path="/user"
            element={
              <ProtectedRoute role="user">
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<LandingContent mode="user" />} />
            <Route path="shop" element={<Shop />} />

            {/* 🛍 Order cukup login, tidak perlu role check */}
            <Route
              path="order/:id"
              element={
                <ProtectedRoute>
                  <Order />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 🛠 ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="templates" element={<ManageTemplates />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </AuthProvider>
  );
}

export default App;
