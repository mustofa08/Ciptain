import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";

import HomeLayout from "../layouts/HomeLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";

import Home from "../pages/Home";
import Shop from "../pages/Shop";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

import UserDashboard from "../pages/user/UserDashboard";
import Order from "../pages/user/Order";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageTemplates from "../pages/admin/ManageTemplates";
import AdminOrders from "../pages/admin/AdminOrders";
import ManageUsers from "../pages/admin/ManageUsers";
import Settings from "../pages/admin/Settings";

import NotFound from "../pages/NotFound";

/* ===== USER WRAPPER (INLINE LAYOUT) ===== */
function UserWrapper() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* 🌍 SEMUA ORANG */}
      <Route element={<HomeLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* redirect profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 👤 USER */}
      <Route
        path="/user"
        element={
          <ProtectedRoute role="user">
            <UserWrapper />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="order/:id" element={<Order />} />
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

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
